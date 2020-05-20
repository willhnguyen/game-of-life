class Coordinates2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Canvas2D {
    /**
     * Generates canvas object that can be manipulated as a 2-dimensional bitmap.
     * 
     * @param {Number} rows Number of rows in grid.
     * @param {Number} cols Number of columns in grid.
     * @param {Number} height Canvas element height.
     * @param {Number} width Canvas element width.
     * @param {String} canvas_id Canvas element identifier.
     * @param {Element} parent Element to append new Canvas element to.
     */
    constructor(rows, cols, height, width, canvas_id, parent) {
        this.id = canvas_id;
        this.rows = rows;
        this.cols = cols;
        this.height = height;
        this.width = width;

        // Create new canvas and append to document
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", canvas_id);
        this.canvas_ctx = this.canvas.getContext(`2d`);
        parent.appendChild(this.canvas);

        // Grid size
        this.canvas.setAttribute("height", `${rows}`);
        this.canvas.setAttribute("width", `${cols}`);
        
        // Canvas element size
        this.canvas.style.height = `${height}px`;
        this.canvas.style.width = `${width}px`;

        // Desired blocky look
        this.canvas.style.imageRendering = "pixelated";
    }

    /**
     * Sets the color of the image
     * 
     * @param {String} color 
     */
    set_color(color) {
        this.canvas_ctx.fillStyle = color;
    }

    /**
     * Fills in the cell at specified (x, y) coordinates.
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    fill_pixel(x, y) {
        
        this.canvas_ctx.fillRect(x, y, 1, 1);
    }

    /**
     * Fills in cells in batch.
     * 
     * @param {Array[Coordinates2D]} pixel_buffer All pixel locations to fill.
     */
    fill_from_buffer(pixel_buffer) {
        for (let coordinates of pixel_buffer) {
            this.canvas_ctx.fillRect(coordinates.x, coordinates.y, 1, 1);
        }
    }

    /**
     * Sets canvas back to default empty state.
     */
    clear() {
        this.canvas_ctx.clearRect(0, 0, this.cols, this.rows);
    }
}

function App() {
    // Setup Canvas2D Element
    let grid_size = 50;
    let game_of_life_canvas = new Canvas2D(grid_size, grid_size, 1000, 1000, "game_of_life_canvas", document.getElementById("app"));
    game_of_life_canvas.set_color("#f00");

    // Test Canvas2D Functionality
    game_of_life_canvas.fill_pixel(10, 10);
    game_of_life_canvas.fill_from_buffer([
        new Coordinates2D(1, 1),
        new Coordinates2D(2, 2),
        new Coordinates2D(3, 3)
    ]);

    // Test Canvas2D Animation
    let count = 0;
    setInterval(() => {
        game_of_life_canvas.clear();
        game_of_life_canvas.fill_pixel(count % grid_size, count % grid_size);
        count++;
    }, 250);
}

App();
