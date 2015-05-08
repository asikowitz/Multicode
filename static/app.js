console.log("HELLO");
console.log("changed3");
var app = new Marionette.Application();

app.addRegions({
    main:"#main",
});


app.on("start",function() {
    console.log("Started");
    file = new File({name:"Test",content:""});
    app.main.show(new app.FileView({model:file}));
    
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

/*var Page = Backbone.Model.extend({});
app.PageView = Marionette.ItemView.extend({
    template : "#view-template",
});*/

app.FileView = Marionette.ItemView.extend({
    template : "#edit-template",
    events : {
	"click #edit" : function() {
	    $("#edit").prop("disabled",true);
	    $("#read").prop("disabled",false);
	    $("#txt-box").css("display","inline-block");
	},
	"click #read" : function() {
	    $("#edit").prop("disabled",false);
	    $("#read").prop("disabled",true);
	    $("#txt-box").css("display","none");
	},
	"keypress #txt-box" : function(){
	    var stuff = $("txt-box").value;
	},
	"click #delete" : function(){
	    this.remove();
	}
    },
});

//var page = new Page({content:"<!doctype html><html><head></head><body><h1>HI</h1></body></html>"});
//var text = new File({name:"File1", content:"hi"});
//var text2 = new File({name:"File2", content:"hi2"});
//var files = new Files([text, text2]);
app.start();
