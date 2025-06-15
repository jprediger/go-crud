package main

import (
	initalizers "go-backend/initializers"
	"net/http"

	"github.com/gin-gonic/gin"
)

var db = make(map[string]string)

// Função que é executada antes de iniciar o servidor
func init() {
	initalizers.LoadEnvVariables()  // Função para carregar as variáveis de ambiente do arquivo .env
	initalizers.ConnectToDatabase() // Função para conectar ao banco de dados
}

func setupRouter() *gin.Engine {
	r := gin.Default()

	// Ping test
	r.GET("/testdb", func(c *gin.Context) {
		var response = initalizers.DB.Exec("SELECT 1") // Testando a conexão com o banco de dados
		if response.Error != nil {
			c.String(http.StatusInternalServerError, "Conexão com o banco de dados falhou: %v", response.Error)
		} else {
			c.String(http.StatusOK, "Conexão com o banco de dados estabelecida com sucesso!")
		}
	})

	// Get user value
	r.GET("/user/:name", func(c *gin.Context) {
		user := c.Params.ByName("name")
		value, ok := db[user]
		if ok {
			c.JSON(http.StatusOK, gin.H{"user": user, "value": value})
		} else {
			c.JSON(http.StatusOK, gin.H{"user": user, "status": "no value"})
		}
	})

	// Authorized group (uses gin.BasicAuth() middleware)
	// Same than:
	// authorized := r.Group("/")
	// authorized.Use(gin.BasicAuth(gin.Credentials{
	//	  "foo":  "bar",
	//	  "manu": "123",
	//}))
	authorized := r.Group("/", gin.BasicAuth(gin.Accounts{
		"foo":  "bar", // user:foo password:bar
		"manu": "123", // user:manu password:123
	}))

	/* example curl for /admin with basicauth header
	   Zm9vOmJhcg== is base64("foo:bar")

		curl -X POST \
	  	http://localhost:8080/admin \
	  	-H 'authorization: Basic Zm9vOmJhcg==' \
	  	-H 'content-type: application/json' \
	  	-d '{"value":"bar"}'
	*/
	authorized.POST("admin", func(c *gin.Context) {
		user := c.MustGet(gin.AuthUserKey).(string)

		// Parse JSON
		var json struct {
			Value string `json:"value" binding:"required"`
		}

		if c.Bind(&json) == nil {
			db[user] = json.Value
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		}
	})

	return r
}

func main() {
	r := setupRouter()
	// Listen and Server in 0.0.0.0:8080
	r.Run()
}
