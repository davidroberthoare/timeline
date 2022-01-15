// GLOBAL VARIABLES
const dateFormats = {
    short:"DD-MM-YY",
    long:"ddd MMM D, YYYY h:mma"
}
const today = moment().unix();
var rangeStart = moment().add(-1,'month').unix();
var rangeEnd = moment().add(1,'month').unix();
var rangeMin = moment().add(-3000,'year').unix();
var rangeMax = moment().add(1000,'year').unix();



var testObj;

// Setup the Canvas
const canvasConfig = {
    backgroundColor: 'lightgrey',
} 
const canvas = new fabric.Canvas('timelineCanvas', canvasConfig);

// resize the canvas container to fit the page
function resizeCanvas(){
    canvas.setDimensions({width: window.innerWidth , height:window.innerHeight});
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// set initial position
canvas.setZoom(0.0005);
rangeStart = canvasToDate(canvas.vptCoords.bl.x);
rangeEnd = canvasToDate(canvas.vptCoords.br.x)




// add the timeline to it
const timeLine = new TimeLine(canvas);

// given a canvas x-point, return the adjusted 'date' xcoordinate, by adding today's unix timestamp
function canvasToDate(point){
    return point + today;
}

// given a unix date, return the adjusted canvas xcoordinate, by subtracting today's unix timestamp
function dateToCanvas(unixStr){
    return unixStr - today;
}

function unZoom(number){
    // console.log("num", number);
    number = number / canvas.getZoom();
    // console.log("unZoomed num", number);
    return number;
}

function zoom(number){
    // console.log("num", number);
    number = number * canvas.getZoom();
    // console.log("Zoomed num", number);
    return number;
}


function correctVertical(object){
    object.top = canvas.vptCoords.tl.y + unZoom(object.originalTop);
    canvas.requestRenderAll();
}

function correctForZoom(object){
    // console.log("current scaleX", object.scaleX);
    object.scaleX = 1 / canvas.getZoom();
    object.scaleY = 1 / canvas.getZoom();
    // console.log("new scaleX", object.scaleX);

    if(object.originalTop){
        correctVertical(object);
    }
}

function correctForZoomAll(){
    let allObj = canvas.getObjects();
    allObj.forEach(element => {
        correctForZoom(element);
    });
}

canvas.on('mouse:wheel', function(opt) {
    // console.log("deltaX,Y", opt.e.deltaX,  opt.e.deltaY)
    
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** opt.e.deltaY;
    if (zoom > .1) zoom = .1;
    if (zoom < 0.000001) zoom = 0.000001;
    
    let scrollScale = .5;
    
    // if we're ZOOMING
    if(opt.e.deltaY!=0){
        canvas.zoomToPoint({ x: opt.e.offsetX, y: canvas.height }, zoom);
        timeLine.setGrid();
    }

    //if we're PANNING
    if(opt.e.deltaX!=0){
        canvas.relativePan({ x: opt.e.deltaX * scrollScale, y: 0 });
        timeLine.setGrid();
    }
    
    rangeStart = canvasToDate(canvas.vptCoords.bl.x);
    rangeEnd = canvasToDate(canvas.vptCoords.br.x)
    
    // if we're ZOOMING
    // if(opt.e.deltaY!=0){
        correctForZoomAll();
    // }

    opt.e.preventDefault();
    opt.e.stopPropagation();
});

function updateRangeDisplay(){
    $("#rangeStart").text(moment.unix(rangeStart).format());
    $("#rangeEnd").text(moment.unix(rangeEnd).format());
}

// provide a unix date and center the view on it
function centerOnDate(unixDate){
    let viewWidth = rangeEnd - rangeStart;
    let newX = zoom(dateToCanvas(unixDate - (viewWidth/2)));
    console.log("centering on unixDate, viewWidth, newX", unixDate, viewWidth, newX);

    canvas.absolutePan({x: newX , y:0}) //pan the view
    
    rangeStart = canvasToDate(canvas.vptCoords.bl.x);
    rangeEnd = canvasToDate(canvas.vptCoords.br.x)
    updateRangeDisplay(); 
    timeLine.setGrid();
    correctForZoomAll();
    canvas.requestRenderAll();
    
    setTimeout(()=>{
        canvas.relativePan({x:1,y:0});  //tweak it...
    },
    100);
}


canvas.on('after:render', function(opt) {
    // console.log("after:render")
    updateRangeDisplay(); 
});


// object MOVE listeners
canvas.on('object:moving', function(opt){
    // if it's a custom object (one we've added that has an ID... then trigger it's MOVE function)
    if(opt.target?.id && myItems.items[opt.target.id]){
        myItems.items[opt.target.id].moveItem(opt.target);
        
    }
});

var myItems = new Items(canvas);   //global store for all items


$(document).ready(function(){
   console.log("ready");

   // create a test rectangle object
    // create a test rectangle object
    // create a test rectangle object
    rect = new fabric.Rect({
        left: dateToCanvas(today),
        originalTop: canvas.height / 2,
        top: unZoom(canvas.height / 2),
        fill: 'blue',
        width: 200,
        height: 200
        // lockScalingY: true
    });

    // "add" rectangle onto canvas
    canvas.add(rect);
    
    
    let line = new fabric.Line([
        dateToCanvas(today),
        600,
        dateToCanvas(today),
        700
    ], 
    {
        originalTop: 700,
        stroke: 'green',
        strokeWidth:1,
        selectable: false,
        evented: false,
    }
    );
    canvas.add(line);


    let item1 = myItems.create({
        type: 'default', 
        relationType: 'fixed',
        relationData: {time: moment().unix()}, 
        title: "This is an Item",
        details: "Details go here",
        attachments: []
    });

    // correctForZoomAll();
    centerOnDate(moment().unix());
});