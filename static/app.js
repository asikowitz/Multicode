console.log("HELLO");

var app = new Marionette.Application();

app.addRegions({
    main:"#main",
    first:"#first",
    second:"#second",
});


app.on("start",function() {
    console.log("Started");
    app.c = new app.Collection();
    console.log(filename,username);
    if (filename != "None" && username != "None" && project != "None") {
	console.log("FETCHING");
	app.cur = new app.File({name:filename,user:username,project:project});
	app.cur.fetch({data:app.cur.toJSON(),processData:true,error:function(d){console.log("ERROR",d)},success:function(d) {
	    console.log(app.cur.get("content"));
	}});
	app.fv = new app.FileView({model:app.cur});
	page = new app.Page({content:app.fv.model.get("content")});
	app.pv = new app.PageView({model:page});
	app.main.show(app.fv);
	//app.first.show(app.cv);
	app.second.show(app.pv);
    }
    //app.fv = new app.FileView({model:app.c.at(0)});
    //app.cv = new app.CV(app.c);
    Backbone.history.start()
});

app.File = Backbone.Model.extend({
    urlRoot:'/file',
    idAttribute:'_id',
    id:'_id',
    initialize : function() {
	console.log(this.id);
    }
});

app.Collection = Backbone.Collection.extend({
    model:app.File,
    url:'/files',
    initialize : function() {
	that = this;
	this.fetch({success:function(d) {
	    console.log("Fetched");
	    if (that.length > 0) {
		console.log("Defaulting to first file");
		if (filename == "None") {
		    app.fv = new app.FileView({model:app.c.at(0)});
		    page = new app.Page({content:app.fv.model.get("content")});
		    app.pv = new app.PageView({model:page});
		    app.main.show(app.fv);
		    //app.first.show(app.cv);
		    app.second.show(app.pv);
		}
	    }
	    else {
		console.log("Making first file.");
		var f = new app.File({name:"First",content:"Start writing here.",project:project,user:username});
		f.save(f.toJSON());
	    }
	}});
    }
});

app.Page = Backbone.Model.extend({});
app.PageView = Marionette.ItemView.extend({
    template : "#view-template",
    model: app.Page,
});

/*app.FV = Marionette.ItemView.extend({
    tagName:'li',
    template:"<%= name %>",
});

app.CV = Marionette.CollectionView.extend({
    el:"ul",
    childView:app.FV,
});*/

app.FileView = Marionette.ItemView.extend({
    template : "#edit-template",
    model : app.File,
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
	"keyup #txt-box" : function(e) {
	    this.model.set({content:$("#txt-box").val()});
	    this.model.save(this.model.toJSON(),{success:function(){}});
	    app.pv.model.set({content:$("#txt-box").val()});
	    app.pv.render();
	},
	"click #delete" : function() {
	    this.remove();
	}
    },
});

//var page = new Page({content:"<!doctype html><html><head></head><body><h1>HI</h1></body></html>"});
//var text = new File({name:"File1", content:"hi"});
//var text2 = new File({name:"File2", content:"hi2"});
//var files = new Files([text, text2]);
app.start();
