console.log("HELLO");

var app = new Marionette.Application();

app.addRegions({
    main:"#main"
});

app.on("start",function() {
    console.log("Started");
    app.c = new app.Collection();
    app.main.show(app.c);
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
});

app.CV = Marionette.CollectionView.extend({
    template : "#main-template",
    itemView : app.PV,
    el : "ul",
});

app.start();
