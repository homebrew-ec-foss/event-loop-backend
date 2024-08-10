package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.PUT("/create/:value", putEndpoint)
	r.GET("/get/:value", getEndpoint)
	r.SET("/set/:value", setEndpoint)

	r.Run(":8080")
}

func putEndpoint(c *gin.Context) {
}

func getEndpoint(c *gin.Context) {

}
func setEndpoint(c *gin.Context) {
}
