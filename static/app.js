console.log("HELLO");
console.log("changed3");
var app = new Marionette.Application();

app.addRegions({
    main:"#main",
});


app.on("start",function() {
    console.log("Started");
    app.c = new app.Collection();
    app.cv = new app.CV({collection:app.c});
    app.main.show(app.cv);
    
    Backbone.history.start()
});

var File = Backbone.Model.extend({
    urlRoot:'/file',
    idAttribute:'_id',
    id:'_id',
    initialize : function() {
	this.on({
	    "change" : function() {
		console.log("Changed " + this);
	    }
	});
    },
});

app.Collection = Backbone.Collection.extend({
    model:app.File,
    url:'/files',
    initialize : function() {
	this.fetch(function(d) {
	    this.render();
	});
	this.on({'add':function() {
	    console.log("added");
	}});
    }
});

var Page = Backbone.Model.extend({});
app.PageView = Marionette.ItemView.extend({
    template : "#view-template",
});

app.FileView = Marionette.ItemView.extend({
    tagName:'tr',
    template : "#edit-template",
    events : {
	"click #edit" : function(){
	    console.log("edit mode");
	    $("#edit").disabled = true;
	    $("#read").disabled = false;
	    $("#txt-box").style.display = "hidden";
	},
	"click #read" : function(){
	    console.log("read mode");
	    $("#edit").disabled = false;
	    $("#read").disabled = true;
	    $("#txt-box").style.display = "none";
	},
	"keypress #txt-box" : function(){
	    var stuff = $("txt-box").value;
	},
	"click #delete" : function(){
	    this.remove();
	}
    },
});

app.CV = Marionette.CompositeView.extend({
    template: "#cv-template",
    events:{
	"click #add":function(e) {
	    that = this;
	    e.preventDefault();
	    var note = $("#note").val();
	    var m = new app.Note({content:note});
	    m.save(m.toJSON(),{success:function(m,r){
		if (r.result.n==1){
		    that.collection.add(m);
		    that.render();
		}
	    }});
	    console.log(m);
	}
    },
    childViewContainer:"table",
    childView:app.FileView,
});

//var page = new Page({content:"<!doctype html><html><head></head><body><h1>HI</h1></body></html>"});
//var text = new File({name:"File1", content:"hi"});
//var text2 = new File({name:"File2", content:"hi2"});
//var files = new Files([text, text2]);
app.start();
