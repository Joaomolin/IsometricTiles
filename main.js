import config from "./config.json" assert {type: 'json'};
import mapInfo from "./map.json" assert {type: 'json'};
import road from "./road.json" assert {type: 'json'};

class App {
	constructor() {
		const app = this;
		app.canvas = document.getElementById("canvas");
		app.ctx = app.canvas.getContext("2d");
		app.btn = document.getElementById("btn");
		app.canvas.width = config.sprite.tileWidth * config.canvas.widthMultiplier;
		app.canvas.height = config.sprite.tileHeight * config.canvas.heightMultiplier;

		app.debug = false;
		app.placingTileIndex = 1;


		app.level = new Level();

		app.run = function () {
			app.initImages();
			app.draw()
		};

		app.draw = function () {
			app.ctx.fillStyle = 'gray';
			app.ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);

			app.drawMap();
			app.drawSelectedTile();
			app.drawDebug();

			requestAnimationFrame(app.draw);
		};

		app.initImages = function () {
			app.initFlatTiles();
		};

		app.initFlatTiles = function () {
			var sheet = new Image();
			sheet.src = "./FlatTiles.png";
			for (let i = 0; i < 6; i++) {
				app.level.tileTypes.push(new Tile(sheet, config.sprite.tileWidth * i, 0, config.sprite.tileWidth, config.sprite.tileHeight));
			}

		}

		app.initRoad = function () {
			var sheet = new Image();
			sheet.src = "/roadHorizontal.png";
			//Transparent tile
			app.level.tileTypes.push(new Tile(sheet, - config.sprite.tileWidth, 0, config.sprite.tileWidth, config.sprite.tileHeight));
			for (let i = 0; i < road.spriteSheetRows; i++) {
				app.level.tileTypes.push(new Tile(sheet, config.sprite.tileWidth * i, 0, config.sprite.tileWidth, config.sprite.tileHeight));
			}

		}

		app.drawSelectedTile = function () {
			app.ctx.strokeStyle = "red";

			const cellx = Math.floor(mouse.x / app.level.tileWidth);
			const celly = Math.floor(mouse.y / app.level.tileHeight);

			selectedTile.x = cellx;
			selectedTile.y = celly;
			selectedTile.xPos = cellx * app.level.tileWidth;
			selectedTile.yPos = celly * app.level.tileHeight;
			selectedTile.selectedX = (celly - config.mapOrigin.y) + (cellx - config.mapOrigin.x);
			selectedTile.selectedY = (celly - config.mapOrigin.y) - (cellx - config.mapOrigin.x);

			app.checkTileOffset();

			var tile = app.level.tileTypes[app.placingTileIndex];
			var x = selectedTile.selectedX + selectedTile.offsetX;
			var y = selectedTile.selectedY + selectedTile.offsetY;
			var isoPt = app.level.cartToIso(new Point(x, y));

			app.ctx.drawImage(tile.img, tile.imgX, tile.imgY, tile.imgW, tile.imgH,
				isoPt.x - tile.imgW / 2, isoPt.y - tile.imgY + tile.imgH / 2, tile.imgW, tile.imgH);

			if (app.debug) {
				app.ctx.strokeRect(selectedTile.xPos, selectedTile.yPos, app.level.tileWidth, app.level.tileHeight);
				app.ctx.strokeStyle = "white";
				app.ctx.strokeRect(isoPt.x - tile.imgW / 2, isoPt.y - tile.imgY + tile.imgH / 2, tile.imgW, tile.imgH);
			}

		};

		app.checkTileOffset = function () {
			let toTheLeft = false;
			let toTheBottom = false;
			if (mouse.x % app.level.tileWidth < app.level.tileWidth / 2) {
				toTheLeft = true;
			}
			if (mouse.y % app.level.tileHeight > app.level.tileHeight / 2) {
				toTheBottom = true;
			}

			const cellx = mouse.x % app.level.tileWidth;
			const celly = mouse.y % app.level.tileHeight;


			selectedTile.offsetX = 0;
			selectedTile.offsetY = 0;

			if (toTheLeft && toTheBottom) {
				if (cellx / 2 + app.level.tileHeight / 2 < celly) {
					selectedTile.offsetY = +1;
				}
			} else if (toTheLeft && !toTheBottom) {
				let nextTile = app.checkUpperLeft(cellx, celly);
				if (nextTile) {
					selectedTile.offsetX = -1;
				}

			} else if (!toTheLeft && toTheBottom) {
				let nextTile = app.checkLowerRight(cellx, celly);
				if (nextTile) {
					selectedTile.offsetX = +1;
				}
			} else if (!toTheLeft && !toTheBottom) {
				if ((cellx - app.level.tileWidth / 2) / 2 > celly) {
					selectedTile.offsetY = -1;
				}
			}

		};

		app.checkLowerRight = function (cellx, celly) {
			const halved = Math.floor((cellx - app.level.tileWidth / 2) / 2);
			celly -= app.level.tileHeight / 2;

			const max = app.level.tileHeight / 2;
			for (let i = 0; i < max; i++) {
				const limit = (max - 1) - i;
				if (halved === i) {
					return celly > limit;
				}
			}

		};

		app.checkUpperLeft = function (cellx, celly) {
			const halved = Math.floor(cellx / 2);
			const max = app.level.tileHeight / 2;

			for (let i = 0; i < max; i++) {
				const limit = (max - 1) - i;
				if (halved === i) {
					return celly <= limit;
				}
			}
		};

		app.drawMap = function () {
			if (app.debug) {
				//Paint tiles a lighter color under everything
				for (var i = 0; i < app.level.map.length; i++) {
					for (var j = 0; j < app.level.map[i].length; j++) {

						var tile = app.level.tileTypes[app.level.map[i][j]];
						var x = j;
						var y = i;
						var isoPt = app.level.cartToIso(new Point(x, y));

						app.ctx.fillStyle = 'darkGray';
						app.ctx.fillRect(isoPt.x, isoPt.y, app.level.tileWidth, app.level.tileHeight);


					}
				}
			}
			//Print tiles
			for (var i = 0; i < app.level.map.length; i++) {
				for (var j = 0; j < app.level.map[i].length; j++) {

					var tile = app.level.tileTypes[app.level.map[i][j]];
					var x = j;
					var y = i;
					var isoPt = app.level.cartToIso(new Point(x, y));


					app.ctx.drawImage(tile.img, tile.imgX, tile.imgY, tile.imgW, tile.imgH,
						isoPt.x, isoPt.y, app.level.tileWidth, app.level.tileHeight);


					if (app.debug) {
						app.ctx.strokeStyle = 'white';
						app.ctx.strokeRect(isoPt.x, isoPt.y, app.level.tileWidth, app.level.tileHeight);
						app.ctx.font = app.ctx.font.replace(/\d+px/, "20px");
						// app.ctx.fillText(`${i} / ${j}`, isoPt.x + app.level.tileWidth / 3, isoPt.y + app.level.tileHeight / 2);
					}
				}
			}
		};

		//Listeners
		//Mouse listener
		const mouse = {
			x: 1,
			y: 1,
		};

		const selectedTile = {
			x: 1,
			y: 1,
			xPos: 1,
			yPos: 1,
			selectedX: 1,
			selectedY: 1,
			offsetX: 0,
			offsetY: 0,
		};

		app.btn.addEventListener('click', function (e) {
			app.debug = !app.debug;
		});

		canvas.addEventListener('click', function (e) {
			const mouse = app.getTileUnderMouse();
			if (mouse.x >= 0 && mouse.x < app.level.map.length && mouse.y >= 0 && mouse.y < app.level.map[mouse.x].length) {
				app.level.map[mouse.y][mouse.x] = app.placingTileIndex;
			} else {
				if (app.placingTileIndex < app.level.tileTypes.length - 1) {
					app.placingTileIndex++;
				} else {
					app.placingTileIndex = 0;
				}
			}


		});


		canvas.addEventListener('mousemove', function (e) {
			const pos = canvas.getBoundingClientRect();
			mouse.x = e.x - pos.x;
			mouse.y = e.y - pos.y;
		});

		canvas.addEventListener('mouseleave', function (e) {
			mouse.x = app.canvas.width / 2;
			mouse.y = app.canvas.height / 2;
		});

		app.drawDebug = function () {
			app.ctx.fillStyle = "black";
			app.ctx.font = app.ctx.font.replace(/\d+px/, "25px");
			if (app.debug) {
				app.ctx.fillText(`MouseTilePos: ${Math.floor(mouse.x) % app.level.tileWidth}, ${Math.floor(mouse.y) % app.level.tileHeight}`, 10, 25);
				app.ctx.fillText(`MapOrigin: ${Math.floor(selectedTile.x)}, ${Math.floor(selectedTile.y)} / Offset ${selectedTile.offsetX},  ${selectedTile.offsetY}`, 10, 75);
				app.ctx.fillText(`SelectedTile(Red): ${Math.floor(selectedTile.xPos)}, ${Math.floor(selectedTile.yPos)}`, 10, 100);
			}

			app.ctx.fillText(`Real grid: ${app.getTileUnderMouse().x} ${app.getTileUnderMouse().y}`, 10, 50);
			app.ctx.font = app.ctx.font.replace(/\d+px/, "19px");
			app.ctx.fillText(`Sprites by Artyom Zagorskiy`, app.canvas.width - 300, 20);
			app.ctx.fillText(`Click outside to change tiles`, app.canvas.width - 300, 40);
			app.ctx.fillText(`Click inside to place tiles`, app.canvas.width - 300, 60);

		};


		app.getTileUnderMouse = function () {
			return new Point(selectedTile.selectedX + selectedTile.offsetX + config.mapOrigin.xOff, selectedTile.selectedY + selectedTile.offsetY + config.mapOrigin.yOff);
		}
	}

}

class Tile {
	constructor(img, imgX, imgY, imgW, imgH) {
		var tile = this;

		tile.img = img;

		tile.imgX = imgX;
		tile.imgY = imgY;
		tile.imgW = imgW;
		tile.imgH = imgH;
	}
}

class Point {
	constructor(x, y) {
		var point = this;

		point.x = x;
		point.y = y;
	}
}


class Level {
	constructor() {
		var level = this;

		level.map = [];


		level.tileWidth = config.sprite.tileWidth;
		level.tileHeight = config.sprite.tileHeight;

		level.tileTypes = [];

		level.cartToIso = function (pt) {
			var tempPt = new Point(0, 0);

			var offsetX = (app.canvas.width / 2) - (level.tileWidth / 2);
			var offsetY = (app.canvas.height / 2) - (level.tileHeight / 2) - ((app.level.map.length * level.tileHeight) / 2) + (level.tileHeight / 2);

			tempPt.x = ((pt.x - pt.y) * (level.tileWidth / 2)) + offsetX;
			tempPt.y = (pt.x + pt.y) * (level.tileHeight / 2) + offsetY;

			return tempPt;
		};

		level.mapJsonToArray = function () {
			const mapJson = mapInfo.layers[0];
			const expectedSize = config.mapGrid.xSize * config.mapGrid.ySize;

			if (mapJson.data.length !== expectedSize) {
				console.log(`Conflicting map size`);
				console.log(`${config.mapGrid.xSize} x ${config.mapGrid.ySize} = ${expectedSize} config tiles, different than ${mapJson.width} x ${mapJson.height} = ${mapJson.data.length} json map tiles`)
				console.log(`Map data will be wrong`);
			}

			level.map.length = 0;//Reset map
			for (let i = 0; i < config.mapGrid.xSize; i++) {
				let arr = [];
				for (let j = 0; j < config.mapGrid.xSize; j++) {
					arr.push(mapJson.data.pop() - 1);
				}
				level.map.push(arr);
			}


		}
		level.mapJsonToArray();
	}
}


var app = new App();

window.onload = app.run;

