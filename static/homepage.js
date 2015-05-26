console.log("HELLO");

var app = new Marionette.Application();

app.addRegions({
    main:"#main"
});

app.on("start",function() {
    console.log("Started");
    if (username != "None") {
	app.c = new app.Collection([],{user:username});
	app.main.show(new app.CV({collection:app.c}));
    }
    Backbone.history.start()
});

app.Project = Backbone.Model.extend({
    urlRoot:'/project',
    idAttribute:'_id',
    id:'_id',
    initialize : function() {
	console.log(this.id);
    }
});

app.Collection = Backbone.Collection.extend({
    model:app.Project,
    url: function() {return "/projects-share/" + this.user;},
    initialize: function(models, options) {
	this.user = options.user;
	this.fetch({success:function(d) {
	    console.log("Fetched");
	}});
    }
});

app.PV = Marionette.ItemView.extend({
    template : "#project-template",
    model : app.Project,
    tagName : "li"
});

app.CV = Marionette.CollectionView.extend({
    childView : app.PV,
    tagName : "ul"
});

//New Project Button
$("#new").click(function() {
    console.log("HI");
    $("#new-container").html('New Project Name: &emsp;\
<input id="new-name"><br><br>\
<button id="new-submit" class="pure-button pure-button-primary">Submit</button> \
</div>');
    
    $("#new-submit").click(function() {
	console.log("HERE",username);
	var name = $("#new-name").val();
	var p = new app.Project({"name":name,"user":username,"shared":[]});
	p.save(p.toJSON(),{success:function(p,r) {
	    console.log(r);
	    if (r.result == "Success") {
		app.c.add(p);
		window.location.assign("/editor/"+username+"/"+p['attributes']['name']);
	    }
	    else {
		console.log('<p style="margin-left: 20px;">'+r.result+'</p>');
		$("#flash-container").html('<div id="flash"><p style="margin-left: 20px;">'+r.result+'</p></div>');
	    }
	}});
    });
});    

app.start();
