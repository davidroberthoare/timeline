// GLOBAL VARIABLES FOR ITEMS


class Items {
    
    constructor(canvas){
        this.items = [];
        this.canvas = canvas;
    }

    create(params){
        let item = new Item(canvas, params);
        this.items[item.id] = item;
        console.log("added item", item, this.items);
    }
}



class Item {
    
    constructor(canvas, params){
        this.canvas = canvas;
        this.id = makeUUID();
        this.type = params.type || "default";
        this.relationType = params.relationType || "fixed";
        this.relationData = params.relationData || {time: moment().unix()};
        this.title = params.title || "Item";
        this.details = params.details || "Details...";
        this.attachments = params.attachments || [];
        console.log("creating Item", this);


        // create the item box and add it to the canvas
        let config ={
            id: this.id,
            x: dateToCanvas(moment().unix())   //default, just in case
        }

        // different configs for different item types
        if(this.relationType=='fixed'){
            config.x = dateToCanvas(this.relationData.time);
        }

        this.canvasObject = this.createItem(config);
        this.canvas.add(this.canvasObject);

    }


    createItem(config){
        console.log("creating item at x", config.x);

        let text = new fabric.Text(
            this.title
        ,{
            originX: 'center',
            originY: 'center',
            fontSize: 12,
            fontFamily: 'sans-serif',
            // fontWeight: weight,
            textAlign: 'center',
          }
        );

        let rect = new fabric.Rect({
            width: text.width * 1.5,
            height:text.height * 2,
            fill:'white',
            stroke:'black',
            strokeWidth:1,
            rx:10,
            ry:10,
            originX: 'center',
            originY: 'center'
          }
        );

          
        let group = new fabric.Group([ rect, text ], {
            id: this.id,
            left: Math.round(config.x),
            top: this.canvas.height - 100,
            originalTop: this.canvas.height - 100,
            selectable: true,
            evented: true,
            hasControls: false,
            lockMovementY: true,
        });


        group.on


        return group;   //send it back to the calling function
        
    }


    moveItem(opt){
        // console.log("moving item", opt);
        let newX = opt.left;
        console.log("new Left", newX, moment.unix(canvasToDate(newX)).format(dateFormats.long));
    }
  
  }