package main

import (
	"fmt"
	"os"
	"strconv"
	"github.com/go-vgo/robotgo"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: mouseMover <x> <y>")
		return
	}

	x, err1 := strconv.Atoi(os.Args[1])
	y, err2 := strconv.Atoi(os.Args[2])

	if err1 != nil || err2 != nil {
		fmt.Println("Please provide valid integer coordinates.")
		return
	}

	robotgo.MoveMouse(x, y)
}
