// p5.js references: https://p5js.org/reference/
// fill bucket: https://stackoverflow.com/questions/21520442/html5-canvas-floodfill

var colourPicker;
var strokeWeightSlider;
var bgColourPicker;
var erasing = false;
var brushtype = "line";
var canvas;
var canvasSize = {
    portrait: [720, 1280],
    landscape: [1280, 720],
    square: [720, 720]};
var currentCanvas = "landscape";
var undoHistory = {
    stack: [],
    index: -1};
var drawing = false;

function setupCanvas(width, height) {
    if (canvas) canvas.remove();
    canvas = createCanvas(width, height);
    canvas.position(0, 100);
    if (bgColourPicker) {
        background(bgColourPicker.value());
    } else {
        background("white");
    }
    saveAction();
}

function setup(){
    colourPicker = createColorPicker("black");
    colourPicker.position(10, 10);

    strokeWeightSlider = createSlider(1, 20, 5, 1); //min, max, default, step
    strokeWeightSlider.position(80, 15);

    bgColourPicker = createColorPicker("white");
    bgColourPicker.position(220, 10);
    bgColourPicker.changed(() => {
        background(bgColourPicker.value());
        saveAction();
    });

    var refreshButton = createButton("Clear Canvas");
    refreshButton.position(300, 10);
    refreshButton.mousePressed(() => {
        background(bgColourPicker.value());
        saveAction();
    });

    var eraserButton = createButton("Eraser");
    eraserButton.position(460, 10);
    eraserButton.mousePressed(() => {
        erasing = true;
        eraserButton.hide();
        drawButton.show();
    });
    var drawButton = createButton("Draw");
    drawButton.position(465, 10);
    drawButton.mousePressed(() => {
        erasing = false;
        drawButton.hide();
        eraserButton.show();
    });
    drawButton.hide();

    var saveButton = createButton("Save");
    saveButton.position(700, 10);
    saveButton.mousePressed(() => {
        saveCanvas(canvas, 'drawing', 'png');
    }); // https://p5js.org/reference/p5/saveCanvas/

    var resizeCanvas = createSelect(); // dropdown menu: https://p5js.org/reference/p5/createSelect/
    var selectedCanvas = canvasSize[currentCanvas];
    resizeCanvas.position(575, 10);
    for (var label in canvasSize) resizeCanvas.option(label);
    resizeCanvas.selected(currentCanvas);
    resizeCanvas.changed(() => {
        currentCanvas = resizeCanvas.value();
        selectedCanvas = canvasSize[currentCanvas];
        setupCanvas(selectedCanvas[0], selectedCanvas[1]);
    });

    var lineBrush = createButton("Line");
    lineBrush.position(10, 50);
    lineBrush.mousePressed(() => {
        brushtype = "line";
    });
    var circleBrush = createButton("Circle");
    circleBrush.position(80, 50);
    circleBrush.mousePressed(() => {
        brushtype = "circle";
    });
    var squareBrush = createButton("Square");
    squareBrush.position(160, 50);
    squareBrush.mousePressed(() => {
        brushtype = "square";
    });

    var undoButton = createButton("Undo");
    undoButton.position(300, 50);
    undoButton.mousePressed(undo);
    var redoButton = createButton("Redo");
    redoButton.position(370, 50);
    redoButton.mousePressed(redo);

    setupCanvas(selectedCanvas[0], selectedCanvas[1]);
}

function draw(){
    strokeWeight(strokeWeightSlider.value());

    if(mouseIsPressed && mouseY > 100){ // check if mouse is inside the canvas
        if (mouseX !== pmouseX || mouseY !== pmouseY) {
            drawing = true;
        }

        if (erasing){
            stroke(bgColourPicker.value());
            fill(bgColourPicker.value());
        }else{
            stroke(colourPicker.value());
            fill(colourPicker.value());
        }
        if (brushtype == "line"){
            line(mouseX, mouseY, pmouseX, pmouseY);
        }else if (brushtype == "circle"){
            let size = strokeWeightSlider.value() * 2;
            ellipse(mouseX, mouseY, size, size);
        }else if (brushtype == "square"){
            let size = strokeWeightSlider.value() * 2;
            rect(mouseX, mouseY, size, size);
        }
    }
}

function mouseReleased(){
    if (drawing) {
        saveAction();
        drawing = false;
    }
} // i thought this function was pretty nice, since it solved the entire issue with the undo and redo by only saving the history when the mouse is released

function repaint(){
    background(bgColourPicker.value());
}

// undo/redo tutorial: https://medium.com/fbbd/intro-to-writing-undo-redo-systems-in-javascript-af17148a852b

function saveAction() {
    undoHistory.stack = undoHistory.stack.slice(0, undoHistory.index + 1);
    undoHistory.stack.push(get());
    undoHistory.index++;
}

function undo(){
    if (undoHistory.index > 0){
        undoHistory.index--;
        image(undoHistory.stack[undoHistory.index], 0, 0);
    }
}
function redo(){
    if (undoHistory.index < undoHistory.stack.length - 1){
        undoHistory.index++;
        image(undoHistory.stack[undoHistory.index], 0, 0);
    }
}
