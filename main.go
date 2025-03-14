package main

import (
	"embed"
	"runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	wailsrt "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	appMenu := menu.NewMenu()

	if runtime.GOOS == "darwin" {
		// necessary on MacOS per https://wails.io/docs/reference/menus
		appMenu.Append(menu.AppMenu())
	}

	fileMenu := appMenu.AddSubmenu("File")
	fileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		wailsrt.Quit(app.ctx)
	})

	if runtime.GOOS == "darwin" {
		// necessary on MacOS for copy/paste/undo to work per https://wails.io/docs/reference/menus
		appMenu.Append(menu.EditMenu())
	}

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "rss-reader-wails",
		Width:  1024,
		Height: 768,
		Menu:   appMenu,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			&FeedViewModel{},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
