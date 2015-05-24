console.log("HELLO");

var app = new Marionette.Application();

app.addRegions({
    main:"#main"
});

app.on("start",function() {
    console.log("Started");
    app.c = new app.Collection();
    app.main.show(new app.CV({collection:app.c}));
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
    url:'/projects',
    initialize : function() {
	that = this;
	this.fetch({success:function(d) {
	    console.log("Fetched");
	}});
    }
});

app.PV = Marionette.ItemView.extend({
    template : "#project-template",
    model : app.Project,
    tagName : "li",
    initialize: function(){ console.log('BookItemView: initialize >>> ' + this.model.get('name')) },
    onRender: function(){ console.log('BookItemView: onRender >>> ' + this.model.get('name')) },
    onShow: function(){ console.log('BookItemView: onShow >>> ' + this.model.get('name')) }
});

app.CV = Marionette.CollectionView.extend({
    childView : app.PV,
    tagName : "ul",
    initialize: function(){ console.log('BookCollectionView: initialize') },
    onRender: function(){ console.log('BookCollectionView: onRender') },
    onShow: function(){ console.log('BookCollectionView: onShow') }
});

$("#new").click(function() {
    console.log("HI");
    $("#new-container").html('New Project Name: &emsp;\
<input id="new-name"><br><br>\
<button id="new-submit" class="pure-button pure-button-primary">Submit</button> \
</div>');
    
    $("#new-submit").click(function() {
	console.log("HERE");
	var name = $("#new-name").val();
	var p = new app.Project({"name":name});
	p.save(p.toJSON(),{success:function(p,r) {
	    console.log(r);
	    if (r.result == "Success") {
		app.c.add(p);
		window.location();
	    }
	    else {
		console.log('<p style="margin-left: 20px;">'+r.result+'</p>');
		$("#flash-container").html('<div id="flash"><p style="margin-left: 20px;">'+r.result+'</p></div>');
	    }
	}});
    });
});
    

app.start();
