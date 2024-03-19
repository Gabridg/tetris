// Get the random number between the range

function getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.ceil(max);

    return Math.floor(Math.random() * (max-min + 1)) + min;
}

// Generate a new Tetronimo sequence

function generateSequence(){
    const sequence = ['I', 'J', 'L','O', 'S', 'T', 'Z'];

    while(sequence.length){
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];

        tetronimoSequence.push(name);
    }
}


// Get the next Tetronimo sequence

function getNextTetronimo(){
    if(tetronimoSequence.length === 0){
        generateSequence();
    }
    
    const name = tetronimoSequence.pop();
    const matrix = tetronimos[name];

    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

    const row = name === 'I' ? -1 : -2;

    return{
        name: name,
        matrix: matrix,
        row: row,
        col: col,
    };
}

//Rotate an item Matrix 90deg

function rotate(matrix){
    const N = matrix.length - 1;

    const result = matrix.map((row, i) => row.map((val, j)=> matrix[N - j][i]));

    return result;
}

// Check to see if the new matrix,row or col is valid

function  isValidMove(matrix, cellRow, cellCol){
    for(let row = 0; row < matrix.length; row++){
        for(let col = 0; col < matrix[row].length; col++){
            if(matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellcol + row >= playfield.length ||

                //if collides with other piece
                playfield[cellRow + row][cellCol + col]
            )){
                return false;
            }
        }
    }
    
    return true;
}

// Place the Tetronimo on the playfield

function placeTetronimo(){
    for(let row = 0; row < tetronimo.matrix.length; row++){
        for(let col = 0; col < tetronimo.matrix[row].length; col++){
            if(tetronimo.matrix[row][col]){
                
                // Games end if piece has any part offscreen
                if(tetronimo.row + row < 0){
                    return showGameOver();
                }

                playfield[tetronimo.row + row][tetronimo.col + col] = tetronimo.name;
            }
        }
    }

    // Check for line clears starting from the bottom and working our way up

    for(let row = playfield.length - 1; row >= 0;){
        if(playfield[row].every(cell => !!cell)){
            for(let r = row; r >= 0; r--){
                for(let c = 0; c < playfield [r].length; c++){
                    playfield[r][c] = playfield[r-1][c];
                }
            }
        } else {
            row --;
        }
    } 

    tetronimo = getNextTetronimo();
}

// Show the GameOver screen

function showGameOver(){
    cancelAnimationFrame(rAF);

    gameOver = true;

    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.filReact(0, canvas.height / 2 - 30, canvas.width, 60);

    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    contxt.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);

}

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
const tetronimoSequence = [];

const playfield = [];

// Populate empty state

for (let row = -2; row < 20; row++){
    playfield[row] = [];

    for(let col = 0; col < 20; col++){
        playfield[row][col] = 0;
    }
}

// Drawing each Tetronimo

const tetronimos = {
    'I' : [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
    ],
    'J' : [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L' : [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O' : [
        [1,1],
        [1,1],
    ],
    'S' : [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z' : [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T' : [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};

// Color of each Tetronimo

const color = {
    'I' : 'cyan',
    'O' : 'yellow',
    'T' : 'purple',
    'S' : 'limegreen',
    'Z' : 'red',
    'J' : 'blue',
    'L' : 'brown',
};

let count = 0;
let tetronimo = getNextTetronimo();
let rAF = null;
let gameOver = false;

// Game loop
function loop(){
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0, canvas.width, canvas.height);

    // Draw playfield

    for(let row = 0; row < 20; row++){
        for(let col = 0; col < 20; col++){
            if(playfield[row][col]){
                const name = playfield[row][col];
                context.fillStyle = colors[name];

                context.fillRect(col * grid, row * grid, grid-1, grid-1);
            }
        }
    }

    if(tetronimo){
        if(++count > 35){
            tetronimo.row++;
            count = 0;

            if(!isValidMove(tetronimo.matrix, tetronimo.row, tetronimo.col)){
                tetronimo.row--;
                placeTetronimo();
            }
        }

        context.fillStyle = colors[tetronimo.name];

        for(let row = 0; row < tetronimo.matrix.length; row++){
            for(let col = 0; col < tetronimo.matrix[col].length; col++){
                if(tetronimo.matrix[row][col]){
                    context.fillRect((tetronimo.col + col) * grid, (tetronimo.row + row) * grid, grid-1, grid-1);
                }
            }
        }
    }
}

// Listen to keyboard events to move the active tetronimo

document.addEventListener('keydown', function(e){
    if(gameOver) return;

    // Left & right arrow keys

    if(e.which === 37 || e.which === 39){
        const col = e.which === 37
        ? tetronimo.col - 1
        : tetronimo.col + 1;

        if(isValidMove(tetronimo.matrix, tetronimo.row, col)){
            tetronimo.col = col;
        }
    }
    
    // Up arrow key to rotate
    if(e.which === 38){
        const matrix = rotate(tetronimo.matrix);
        if(isValidMove(matrix, tetronimo.row, tetronimo.col)){
            tetronimo.matrix = matrix;
        }
    }

    // Down arrow key to drop
    if(e.which === 40){
        const row = tetronimo.row + 1;

        if(isValidMove(tetronimo.matrix, row, tetronimo.col)){
            tetronimo.row = row - 1;

            placeTetronimo();
            return;
        }

        tetronimo.row = row;
    }
});

// Start the Game

rAF = requestAnimationFrame(loop);