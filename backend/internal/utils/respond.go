package utils

import "github.com/gin-gonic/gin"

// JSONError sends a standardized error payload.
func JSONError(ctx *gin.Context, code int, message string) {
	ctx.AbortWithStatusJSON(code, gin.H{"error": message})
}

// JSON sends a standard success payload.
func JSON(ctx *gin.Context, code int, data interface{}) {
	ctx.JSON(code, gin.H{"data": data})
}
