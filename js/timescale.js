// GLOBAL VARIABLES FOR TIMESCALE

class TimeLine {
    
    constructor(canvas){
        this.canvas = canvas;
        this.timeViewRange = this.canvas.vptCoords.tr.x - this.canvas.vptCoords.tl.x; // amount of time in the view window, measured in seconds
        console.log("creating TimeLine", this.timeViewRange);
        this.maxGridLines = 50; //the maximum number of lines on the view before rescaling
        this.gridSpacing = 10;  //default grid spacing before rescaling;
        this.lineHeight = 50;   //default height of the grid
        this.viewRangeUnit = 'hour';
        
       
        

        this.lineGroup = {}; 


        this.tickFormats = {minor:"ha", major: "ddd d"};
        this.viewRanges = {
            hour: {min:"0", minorFormat:"h:mm", majorFormat: "ddd D"},
            day: {min:"200000", minorFormat:"dd D", majorFormat: "MMM D"},
            month: {min:"7500000", minorFormat:"MMM", majorFormat: "MMM YYYY"},
            year: {min:"75000000", minorFormat:"YYYY", majorFormat: "YYYY"},
        }


    }

    setGrid(){
        // console.log("setGrid")

        // determine scale display-range based on date start-end
        const viewWidth = rangeEnd - rangeStart;
        const lastRangeUnit = this.viewRangeUnit;

        // Object.keys(this.viewRanges).forEach(key=>{console.log(key)})

        Object.keys(this.viewRanges).forEach(key => {
            if(viewWidth > this.viewRanges[key].min) this.viewRangeUnit = key;
        });

        $("#rangeMid").text(viewWidth + " - " + this.viewRangeUnit);

        //if we've just switched to a new unit, then wipe the lines from the array and canvas, and set the tickLabel formats
        if(this.viewRangeUnit != lastRangeUnit){
            // console.log("CLEARING LINES", this.lineGroup);
            // wipe group and canvas
            for(const key in this.lineGroup) {
                this.canvas.remove(this.lineGroup[key].tick);
                this.canvas.remove(this.lineGroup[key].label);
                delete this.lineGroup[key];
            }

            //update the tick label formats
            this.tickFormats.minor = this.viewRanges[this.viewRangeUnit].minorFormat;
            this.tickFormats.major = this.viewRanges[this.viewRangeUnit].majorFormat;
        }

        //determine start point in the middle of current screen, rounding to nearest unit
        const viewMiddle = rangeEnd - (viewWidth/2);
        const middleUnitMoment = moment.unix(viewMiddle).startOf(this.viewRangeUnit);
        // console.log('viewMiddle', viewMiddle, middleUnitMoment.format())


        //starting from midpoint, go both ways checking if there is a line at that next unit-x-point, until off-screen either way.
        // GO RIGHT
        let xTime = middleUnitMoment;
        let x = dateToCanvas(xTime.unix());
        while (x < dateToCanvas(rangeEnd)) {
            
            // if there's not already a line at that position 
            //add a line
            if( this.lineGroup.hasOwnProperty(x) == false){
                // console.log("adding line RIGHT at", x, dateToCanvas(rangeEnd));
                const line = this.createLine(x, this.canvas.height);
                this.lineGroup[x] = (line);
                this.canvas.add(line.tick);
                this.canvas.add(line.label);
            }
            // add a text label
            
            xTime.add(1,this.viewRangeUnit);
            x = dateToCanvas(xTime.unix());
            // console.log("new xTime", xTime.unix());
        }
        
// NOW GO LEFT
        xTime = middleUnitMoment;
        x = dateToCanvas(xTime.unix());
        while (x > dateToCanvas(rangeStart)) {
            
            // if there's not already a line at that position 
            //add a line
            if( this.lineGroup.hasOwnProperty(x) == false){
                // console.log("adding line LEFT at", x, dateToCanvas(rangeEnd));
                const line = this.createLine(x, this.canvas.height);
                this.lineGroup[x] = (line);
                this.canvas.add(line.tick);
                this.canvas.add(line.label);
            }
            
            
            xTime.add(-1, this.viewRangeUnit);
            x = dateToCanvas(xTime.unix());
            // console.log("new xTime", xTime.unix());
        }


        // strip out any OUTSIDE the range lext or right
        for(const key in this.lineGroup) {
            if (this.lineGroup.hasOwnProperty.call(this.lineGroup, key)) {
                const line = this.lineGroup[key].tick;
                const label = this.lineGroup[key].label;
                // console.log(line.left, this.canvas.vptCoords.tl.x, this.canvas.vptCoords.tr.x);
                // if it's outside the range delete it
                if(line.left > this.canvas.vptCoords.tr.x || line.left < this.canvas.vptCoords.tl.x){
                    this.canvas.remove(line);
                    this.canvas.remove(label);
                    delete this.lineGroup[key];
                }
                
            }
        }

        // console.log("this.lineGroup", this.lineGroup)

    }

    createLine(x, y){

        let tickHeight = this.lineHeight;
        let tickWidth = 2;
        let tickColor = 'black';
        
        
        let weight = 'normal';
        
        let labelMoment = moment.unix(canvasToDate(x));
        let label = "";
        if(
            (this.viewRangeUnit=='hour' && labelMoment.hour() == 0) ||
            (this.viewRangeUnit=='day' && labelMoment.date() == 1) ||
            (this.viewRangeUnit=='month' && labelMoment.month() == 0) ||
            (this.viewRangeUnit=='year' && labelMoment.year() % 10 == 0)
            ){
                label = labelMoment.format(this.tickFormats.major);
                weight = 'bold';
            }else{
                label = labelMoment.format(this.tickFormats.minor);
                tickHeight = tickHeight * 0.8;
                tickWidth = tickWidth * 0.5;
                tickColor = 'grey';
        }


        let textSize = 10;
        let text = new fabric.Text(
            label.toString()
        ,{
            left: Math.round(x), 
            top: Math.round(y - this.lineHeight - (textSize*1.5)),
            originalTop: Math.round(y - this.lineHeight - (textSize*1.5)),
            fontSize: textSize,
            fontFamily: 'sans-serif',
            fontWeight: weight,
            textAlign: 'center',
            // stroke: 'black',
            strokeWidth:1,
            selectable: false,
            evented: false,
          }
        );


        let line = new fabric.Line([
            Math.round(x),
            Math.round(y),
            Math.round(x),
            Math.round(y + tickHeight)
        ], 
        {
            originalTop: Math.round(y - tickHeight),
            stroke: tickColor,
            strokeWidth: tickWidth,
            selectable: false,
            evented: false,
          }
        );

        return {"tick": line, "label":text};
    }
  
  }