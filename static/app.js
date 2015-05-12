console.log("HELLO");
console.log("changed11");
var App = new Marionette.Application();

App.addRegions({
    firstRegion:"#first-region",
    secondRegion:"#second-region",
    thirdRegion:"#third-region",
});


App.on("start",function() {
    console.log("Started");

    var filesview = new App.FilesView({collection:files});
    App.secondRegion.show(filesview);

    var fileview = new App.FileView({model:text});
    App.firstRegion.show(fileview);
    
    var pageview = new App.PageView({model:page});
    App.thirdRegion.show(pageview);

    Backbone.history.start();
});

App.PageView = Marionette.ItemView.extend({
    template : "#view-template",
});    

App.FileView = Marionette.ItemView.extend({
    template : "#edit-template",
    events : {
	"click #edit" : "edit",
	"click #read" : function(){
	    console.log("read mode");
	    editButton = document.getElementById("edit");
	    editButton.disabled = false;
	    readButton = document.getElementById("read");
	    readButton.disabled = true;
	    var box = document.getElementById("txt-box");
	    box.style.display = "none";
	},	
//	"keypress #txt-box" : function(e){
//	    character = e.key;
//	    if (character == "Backspace"){
//		this.backspace();
//	    }else{
//		if (character == "Enter"){
//		    character = "\n";
//		}
//		if (character == "Tab"){
//		    character = "\t";
//		}
//	    this.update(character);
//	    }
//	    this.update();
//	},
	"keypress #txt-box" : function(){
	    var box = document.getElementById("txt-box");
	    var stuff = box.value;
	    console.log(stuff);
	    this.update(stuff);
	    
	    var m = new App.Note({content:note});
	    m.save(m.toJSON(),{success:function(m,r){
		if (r.result.n==1){
		    that.collection.add(m);
		    that.render();
		}
	    }});
	},
	"click #delete" : function(){
	    this.remove();
	}
    },
    caret : 0,
    edit : function(){
	console.log("edit mode");
	editButton = document.getElementById("edit");
	editButton.disabled = true;
	readButton = document.getElementById("read");
	readButton.disabled = false;
	var box = document.getElementById("txt-box");
	box.style.display = "inline-block";
    },
    update : function(stuff){
	var box = document.getElementById("txt-box");
	console.log(doGetCaretPosition(box));
	caret = doGetCaretPosition(box);
	this.model.set('content',stuff);

	setCaretPosition(box,caret);

//	before = this.model.attributes.content;
//	this.model.set('content',before+character);
//	var box = document.getElementById("txt-box");
//	this.cursor();
    },
    backspace : function(){
	before = this.model.attributes.content;
	this.model.set('content',before.slice(0,before.length-1));
	this.cursor();
    },
    cursor : function(){
	this.edit();
	//this moves the cursor back to the textarea after updating content
	var box = document.getElementById("txt-box");
	//box.focus();
	//var v = box.value;
	//box.value = '';
	//box.value = v;
	
	setCaretPosition(box,caret+1);
    },
    modelEvents : {
	"change" : function() {this.render()}
    }
});

App.FilesView = Marionette.CollectionView.extend({
    childView : App.FileView
});

var myController = Marionette.Controller.extend({
    oneRoute : function(){
	console.log("OneRoute");
	App.firstRegion.show(new App.FileView({model:text}));
    },
    twoRoute : function(){
	console.log("TwoRoute");
	App.firstRegion.show(new App.FileView({model:text2}));
    },
});

App.controller = new myController();
App.router = new Marionette.AppRouter({
    controller: App.controller,
    appRoutes:{
	"one":"oneRoute",
	"two":"twoRoute"
    }
});


function doGetCaretPosition (ctrl) {
    var CaretPos = 0;
    // IE Support
    if (document.selection) {	
	ctrl.focus ();
	var Sel = document.selection.createRange ();	
	Sel.moveStart ('character', -ctrl.value.length);	
	CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl.selectionStart || ctrl.selectionStart == '0')
	CaretPos = ctrl.selectionStart;    
    return (CaretPos);    
}
function setCaretPosition(ctrl, pos)
{    
    if(ctrl.setSelectionRange){
	ctrl.focus();
	ctrl.setSelectionRange(pos,pos);
    }else if (ctrl.createTextRange) {
	var range = ctrl.createTextRange();
	range.collapse(true);
	range.moveEnd('character', pos);
	range.moveStart('character', pos);
	range.select();
    }
}


var File = Backbone.Model.extend({});
var Files = Backbone.Collection.extend({
    model:File
});
var Page = Backbone.Model.extend({});

var page = new Page({content:"<!doctype html><html><head></head><body><h1>HI</h1></body></html>"});
var text = new File({name:"File1", content:"hi"});
var text2 = new File({name:"File2", content:"hi2"});
var files = new Files([text, text2]);
App.start();
