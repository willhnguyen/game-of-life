class Coordinates2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromString(coordinateString) {
        const [x, y] = coordinateString.split(',').map(value => parseInt(value));
        return new Coordinates2D(x, y);
    }

    toString() {
        return `${this.x},${this.y}`;
    }

    get surroundingCoordinates() {
        return [
            [this.x - 1, this.y - 1],
            [this.x - 1, this.y],
            [this.x - 1, this.y + 1],
            [this.x, this.y - 1],
            [this.x, this.y + 1],
            [this.x + 1, this.y - 1],
            [this.x + 1, this.y],
            [this.x + 1, this.y + 1],
        ].map(coordinates => new Coordinates2D(...coordinates));
    }

    equals(coordinates_b) {
        return this.x === coordinates_b.x && this.y === coordinates_b.y;
    }
}

const GameState = {
    PAUSE: 0,
    PLAY: 1
}

class GameOfLife {
    constructor(initial_live_cells, grid, generation_time = 1000) {
        this.initial_live_cells = {...initial_live_cells};
        this.live_cells = initial_live_cells;
        this.game_state = GameState.PAUSE;
        this.generation_time = generation_time;
        this.calculate_next_state_interval_id = null;
        this._canvas = null;
        this.grid = grid;
    }

    set canvas(canvas_element) {
        this._canvas = canvas_element;
        this.render();
    }

    set generationTime(value) {
        this.generation_time = value;
    }

    start() {
        if (this.game_state === GameState.PLAY) return;

        this.game_state = GameState.PLAY;
        function _steps(game_of_life) {
            return () => {
                game_of_life.calculateNextState();
                game_of_life.render();
            }
        }

        this.calculate_next_state_interval_id = setInterval(() => {
            this.calculateNextState();
            this.render();
        },
        // _steps(this),
        this.generation_time
        );
    }
    pause() {
        if (this.game_state === GameState.PAUSE) return;

        this.game_state = GameState.PAUSE;
        clearInterval(this.calculate_next_state_interval_id);
        this.calculate_next_state_interval_id = null;
    }
    reset() {
        if (this.game_state === GameState.PLAY) {
            this.pause();
        }
        
        this.live_cells = {...this.initial_live_cells};
    }
    
    render() {
        this._canvas.clear();
        this._canvas.fill_from_buffer(
            Object.values(this.live_cells)
        );
    }
    
    willLive(coordinates, countLivingNeighbors) {
        if (coordinates.toString() in this.live_cells) {
            return countLivingNeighbors > 1 && countLivingNeighbors < 4;
        }

        return countLivingNeighbors === 3;
    }
    
    calculateNextState() {
        const relevant_coordinates = Object.values(this.live_cells).map(coordinate => coordinate.surroundingCoordinates).reduce((a, b) => a.concat(b), []);
        const next_generation_live_cells = {};

        // Count living neighbors
        const living_neighbor_count = {};
        for (let coordinate of relevant_coordinates) {
            let valid = this.grid.areCoordinatesValid(coordinate);
            if (!valid) {
                continue;
            }
            const coordinate_key = coordinate.toString();
            if (!(coordinate_key in living_neighbor_count)) living_neighbor_count[coordinate_key] = 0;
            living_neighbor_count[coordinate_key] += 1;
        }

        // Create next state of this.live_cells
        for (const coordinate_key in living_neighbor_count) {
            const living_neighbors = living_neighbor_count[coordinate_key];
            if (this.willLive(coordinate_key, living_neighbors)) {
                next_generation_live_cells[coordinate_key] = Coordinates2D.fromString(coordinate_key);
            }
        }
        this.live_cells = next_generation_live_cells;
    }

    
}

class Grid {
    constructor(rows, cols, cell_size) {
        this.rows = rows;
        this.columns = cols;
        this.cell_size = cell_size;
    }

    areCoordinatesValid(coordinates) {
        let valid = (coordinates.x >= 0) && (coordinates.y >= 0) && (coordinates.x < this.columns) && (coordinates.y < this.rows);
        return valid;
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
    let grid_size = 50;
    // TODO: Replace cell size with dimensions for a grid to fit the window viewport + controls.
    // Ensure cells are squares.
    let cell_size = 20;
    let grid = new Grid(grid_size, grid_size, cell_size);
    // Setup Canvas2D Element
    let game_of_life_canvas = new Canvas2D(
        grid.rows,
        grid.columns,
        grid.cell_size * grid.rows,
        grid.cell_size * grid.columns,
        "game_of_life_canvas",
        document.getElementById("app"),
    );
    game_of_life_canvas.set_color("#f00");

    let initial_cells = [ // Simple oscillator
        [1,1],
        [2,1],
        [3,1]
    ];
    let initial_state = {};
    for (let [x, y] of initial_cells) {
        let coordinate = new Coordinates2D(x, y);
        initial_state[coordinate.toString()] = coordinate;
    }
    let game_of_life = new GameOfLife(initial_state, grid);
    game_of_life.canvas = game_of_life_canvas;
    game_of_life.start();
}

App();
