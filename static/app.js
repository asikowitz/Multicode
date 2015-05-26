console.log("HELLO");

var app = new Marionette.Application();
var refresh_var;
var ref_page_var;
var valid = false;
var you_type = false;

var refresh = function() {
    app.cur.fetch({data:app.cur.toJSON(),processData:true});
};

var ref_page = function() {
    app.pv.model.set({content:app.cur.get("content")});
    app.pv.render();
};

app.addRegions({
    main:"#main",
    first:"#first",
    second:"#second",
});

app.main.on("show", function() {
    app.editor = CodeMirror.fromTextArea(document.getElementById("textarea"),{mode:"htmlmixed"});
    app.editor.getDoc().setValue(app.cur.get("content"));
    valid = true;
});

app.on("start",function() {
    console.log("Started");
    console.log(filename,username);
    app.c = new app.Collection([],{user:p_user,project:project});
    if (filename != "None" && username != "None" && project != "None") {
	console.log("FETCHING");
	app.cur = new app.File({name:filename,user:p_user,project:project});
	app.cur.fetch({data:app.cur.toJSON(),processData:true,
		       error:function(d) {
			   	console.log("ERROR",d)
		       },
		       success:function(d) { //Stuff can only run once fetch has happened
			   console.log(app.cur);
			   app.fv = new app.FileView({model:app.cur});
			   page = new app.Page({content:app.fv.model.get("content")});
			   app.pv = new app.PageView({model:page});
			   app.cv = new app.CollectionView({collection:app.c})
			   app.main.show(app.fv);
			   app.first.show(app.cv);
			   app.second.show(app.pv);
			   refresh_var = setInterval(refresh, 100);
			   ref_page_var = setInterval(ref_page, 100);
		       }});
    }
    //If there is no filename, need to fetch collection before getting file
    //Backbone.history.start()
});

app.File = Backbone.Model.extend({
    urlRoot:'/file',
    idAttribute:'_id',
    id:'_id',
    initialize : function() {
	this.on({
	    "change":function() {
		//console.log('yt', you_type);
		if (valid) {
		    //$("#txt-box").val(that.get("content"));
		    if(you_type == false){
			console.log('cnhg2');
			var cursor = app.editor.getCursor();
			app.editor.setValue(this.get("content"));
			app.editor.setCursor(cursor);
	    	}
		}
	    }
	});
    }
});

app.Collection = Backbone.Collection.extend({
    model:app.File,
    url:'/files-share',
    initialize : function(models,options) {
	this.user = options.user;
	this.project = options.project;
	this.fetch({data:{'user':this.user,'project':this.project},processData:true,
		    error:function(d) {
			console.log("ERRORS",d);
		    },
		    success:function(d) {
			console.log("Fetched",d);
			if (filename == "None") { //If no filename specified
			    if (app.c.length > 0) {
				console.log("Defaulting to first file");
				app.cur = app.c.at(0);
				app.fv = new app.FileView({model:app.cur});
				page = new app.Page({content:app.fv.model.get("content")});
				app.pv = new app.PageView({model:page});
				app.cv = new app.CollectionView({collection:app.c})
				app.main.show(app.fv);
				app.first.show(app.cv);
				app.second.show(app.pv);
				refresh_var = setInterval(refresh, 100);
				ref_page_var = setInterval(ref_page, 100);
			    }
			    else {
				//window.location.assign("/newfile/"+project);
			    }
			}
		    }});
    }
});

app.FV = Marionette.ItemView.extend({
    template : "<script type='text/template'><%- name %></script>", //"#file-template",
    model : app.File,
    tagName : "li",
	className: "pure-menu-link",
	id: 'file_click',
	events: {
		'click': function(e){
			console.log(e);
			/*
			app.cur = new app.File({name:filename,user:p_user,project:project});
			app.cur.fetch({data:app.cur.toJSON(),processData:true,
				       error:function(d) {
					   	console.log("ERROR",d)
				       },
				       success:function(d) { //Stuff can only run once fetch has happened
					   console.log(app.cur);
					   app.fv = new app.FileView({model:app.cur});
					   page = new app.Page({content:app.fv.model.get("content")});
					   app.pv = new app.PageView({model:page});
					   app.cv = new app.CollectionView({collection:app.c})
					   app.main.show(app.fv);
					   app.first.show(app.cv);
					   app.second.show(app.pv);
					   refresh_var = setInterval(refresh, 100);
					   ref_page_var = setInterval(ref_page, 100);
				       }});
		    }
			*/
		}
	}
});

app.CollectionView = Marionette.CollectionView.extend({
    childView : app.FV,
    tagName : "ul",
	className: "pure-menu-item"
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
	/*"click #edit" : function() {
	  $("#edit").prop("disabled",true);
	  $("#read").prop("disabled",false);
	  $("#txt-box").css("display","inline-block");
	  },
	  "click #read" : function() {
	  $("#edit").prop("disabled",false);
	  $("#read").prop("disabled",true);
	  $("#txt-box").css("display","none");
	  },*/
	"keyup .CodeMirror" : function(e) {
	    you_type = true;
	    setTimeout(function(){
		you_type = false;
	    },500);
	    
	    //console.log('chng');
	    //window.clearInterval(refresh_var);
	    this.model.set({content:app.editor.getValue()});
	    this.model.save(this.model.toJSON(),{success:function(){}});
	    //app.pv.model.set({content:$("#txt-box").val()});
	    //app.pv.render();
	    //refresh_var = window.setInterval(refresh,100);
	},
	"click #delete" : function() {
	    this.remove();
	}
    },
});

$("#sharing").click(function(){window.location = "/sharing/"+project});

app.start();
