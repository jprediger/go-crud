package main

import (
	"go-backend/controllers"
	initalizers "go-backend/initializers"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var db = make(map[string]string)

// Função que é executada antes de iniciar o servidor
func init() {
	initalizers.LoadEnvVariables()  // Função para carregar as variáveis de ambiente do arquivo .env
	initalizers.ConnectToDatabase() // Função para conectar ao banco de dados
	initalizers.LoadAwsProfile()    // Função para carregar o perfil AWS
}

func setupRouter() *gin.Engine {
	r := gin.Default()

	// Adicione o middleware CORS aqui
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// Rota presigned-url
	r.POST("/generate-upload-url", controllers.GenerateUploadURL)

	// Rotas users
	r.POST("/organizations", controllers.CreateOrganization)
	r.GET("/organizations", controllers.GetOrganizations)
	r.GET("/organizations/:id", controllers.GetOrganizationByID)
	r.PATCH("/organizations/:id", controllers.UpdateOrganization)
	r.DELETE("/organizations/:id", controllers.DeleteOrganization)

	// Rotas datasets
	r.POST("/datasets", controllers.CreateDataset)
	r.GET("/datasets", controllers.GetDatasets)
	r.GET("/datasets/:id", controllers.GetDatasetByID)
	r.PATCH("/datasets/:id", controllers.UpdateDataset)
	r.DELETE("/datasets/:id", controllers.DeleteDataset)

	// Rotas dataSources
	r.POST("/datasources", controllers.CreateDataSource)
	r.GET("/datasources", controllers.GetDataSources)
	r.GET("/datasources/:id", controllers.GetDataSourceByID)
	r.PATCH("/datasources/:id", controllers.UpdateDataSource)
	r.DELETE("/datasources/:id", controllers.DeleteDataSource)

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
	r.Run()
}
