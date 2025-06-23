package middlewares

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Estrutura do JWKS
type JWK struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type JWKS struct {
	Keys []JWK `json:"keys"`
}

var (
	jwksCache      = make(map[string]*rsa.PublicKey)
	jwksCacheMutex sync.RWMutex
	lastJWKSFetch  time.Time
)

const jwksURL = "https://cognito-idp.<região>.amazonaws.com/<userPoolId>/.well-known/jwks.json" // Substitua <região> e <userPoolId>

// Busca e faz cache das chaves públicas do Cognito
func getPublicKey(kid string) (*rsa.PublicKey, error) {
	jwksCacheMutex.RLock()
	key, found := jwksCache[kid]
	jwksCacheMutex.RUnlock()
	if found {
		return key, nil
	}

	// Atualiza o cache a cada 6 horas
	if time.Since(lastJWKSFetch) > 6*time.Hour {
		if err := fetchAndCacheJWKS(); err != nil {
			return nil, err
		}
	}

	jwksCacheMutex.RLock()
	key, found = jwksCache[kid]
	jwksCacheMutex.RUnlock()
	if !found {
		return nil, errors.New("chave pública não encontrada")
	}
	return key, nil
}

func fetchAndCacheJWKS() error {
	resp, err := http.Get(jwksURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var jwks JWKS
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return err
	}

	cache := make(map[string]*rsa.PublicKey)
	for _, key := range jwks.Keys {
		if key.Kty != "RSA" {
			continue
		}
		nBytes, err := base64.RawURLEncoding.DecodeString(key.N)
		if err != nil {
			continue
		}
		eBytes, err := base64.RawURLEncoding.DecodeString(key.E)
		if err != nil {
			continue
		}
		e := 0
		for _, b := range eBytes {
			e = e<<8 + int(b)
		}
		pubKey := &rsa.PublicKey{
			N: new(big.Int).SetBytes(nBytes),
			E: e,
		}
		cache[key.Kid] = pubKey
	}

	jwksCacheMutex.Lock()
	jwksCache = cache
	lastJWKSFetch = time.Now()
	jwksCacheMutex.Unlock()
	return nil
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido"})
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			kid, ok := token.Header["kid"].(string)
			if !ok {
				return nil, errors.New("kid não encontrado no header do token")
			}
			return getPublicKey(kid)
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Claims inválidas"})
			return
		}
		c.Set("claims", claims)
		c.Next()
	}
}
