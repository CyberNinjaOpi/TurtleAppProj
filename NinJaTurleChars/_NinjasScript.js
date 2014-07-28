/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var TurtleApp = {};
/*Array holds all characters*/
TurtleApp.characters = [];
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*Creates character objects*/
TurtleApp.Character = function (name, weapon, picture, type) {
    this.name = name;
    this.weapon = weapon;
    this.picture = picture;
    this.type = type;
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*URL of firebase*/
TurtleApp.Url = "https://ninjaturtlesapp.firebaseio.com/";
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*Creates the URLs*/
TurtleApp.makeURL = function (baseUrl, arr) {
    if (!baseUrl) {
        baseUrl = TurtleApp.Url;
    }
    if (!arr) {
        arr = [];
    }
    return baseUrl + "/" + arr.join("/") + ".json";
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.drawTable = function () {
    var holder = "<table class='table table-hover'>";
    /*Table header*/
    holder += "<tr>";
    holder += "<th>Name</th><th>Weapon</th><th>Picture</th><th>Type</th><th><i class='fa fa-cog'></i></th>"
    holder += "</tr>"
    /*The loop over the characters?*/
    for (var c in TurtleApp.characters) {
        holder += "<tr>";
        holder += "<td>" + TurtleApp.characters[c].name + "</td>";
        holder += "<td>" + TurtleApp.characters[c].weapon + "</td>";
        holder += "<td>" + TurtleApp.characters[c].picture + "</td>";
        holder += "<td>" + TurtleApp.characters[c].type + "</td>";
        holder += "<td> \
               <button class='btn btn-default' onclick='TurtleApp.startEdit(" + c + ")'> \
               <i class='fa fa-edit'></i></button> \
               </td>";
        holder += "</tr>";
    }
    holder += "</table>";
    document.getElementById("character-table").innerHTML = holder;
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.addCharacter = function () {
    var h = TurtleApp.getAndClear(["name", "weapon", "picture", "type"]);
    TurtleApp.sendToFirebase(new TurtleApp.Character(h.name, h.weapon, h.picture, h.type));
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.startEdit = function (index) {
    var editCharacter = TurtleApp.characters[index];
    document.getElementById("deleteButton").onclick = function () { TurtleApp.deleteCharacter(index); };
    document.getElementById("saveChanges").onclick = function () { TurtleApp.save(index); };
    document.getElementById("modalTitle").innerHTML = editCharacter.name;
    document.getElementById("editName").value = editCharacter.name;
    document.getElementById("editWeapon").value = editCharacter.weapon;
    document.getElementById("editPicture").value = editCharacter.picture;
    document.getElementById("editType").value = editCharacter.type;
    $("#modal").modal();
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.save = function (i) {
    var editingCharacter = TurtleApp.characters[i];
    var editedCharacter = new TurtleApp.Character();
    editedCharacter.name = document.getElementById("editName").value;
    editedCharacter.weapon = document.getElementById("editWeapon").value;
    editedCharacter.picture = document.getElementById("editPicture").value;
    editedCharacter.type = document.getElementById("editType").value;
    TurtleApp.Ajax("PATCH",
        TurtleApp.makeURL(
        null,
        [editingCharacter.firebaseId]),
        function () {
            TurtleApp.characters[i] = editedCharacter;
            TurtleApp.drawTable();
        },
        function () {
            alert("Please try again!");
        },
        editedCharacter
        );
    $("#modal").modal("hide");
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.deleteCharacter = function (i) {
    var deadCharacter = TurtleApp.characters[i];
    $("#modal").modal('hide');
    TurtleApp.Ajax("DELETE", TurtleApp.makeURL(null, [deadCharacter.firebaseId]),
        function () {
            TurtleApp.characters.splice(i, 1);
            TurtleApp.drawTable();
        },
        function () {
            alert("Delete function failed...Please try again!");
        }
        );
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.getAndClear = function (/*Element id strings*/input) {
    holder = {};
    for (var i in input) {
        holder[input[i]] = document.getElementById(input[i]).value;
        document.getElementById(input[i]).value = "";
    }
    return holder;
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.Ajax = function (verb, url, success, failure, data) {
    var xhr = new XMLHttpRequest();
    xhr.open(verb, url);
    xhr.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            console.log("Success");
            var response = JSON.parse(this.response);
            if (typeof success === "function") { success(response); }
        }
        else {
            console.log("Failure");
            if (typeof failure === "function") { failure(this.status + ":" + this.response) }
        }
    };
    xhr.onerror = function () {
        console.log("Communication Error");
        if (typeof failure === "function") { failure("Communication Error") }
    };
    xhr.send(JSON.stringify(data));
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.sendToFirebase = function (character) {
    TurtleApp.Ajax(
        "Post",
        TurtleApp.makeURL(),
        function (data) { /*Success Callback Function*/
            character.firebaseId = data.name;
            TurtleApp.characters.unshift(character);
            TurtleApp.drawTable();
        },
        alert,/*On Failure*/
        character /*Sends the Character as data*/
        );
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TurtleApp.getAllFromFirebase = function () {
    TurtleApp.Ajax(
       "GET",
       TurtleApp.makeURL(),/*Success Callback*/
       function (rdata/*this is response when the ajax hands it in*/) {
           for (var c in rdata) {
               /*Sets and shares prototype of characters*/
               rdata[c].__proto__ = TurtleApp.Character.prototype;
               rdata[c].firebaseId = c;
               TurtleApp.characters.push(rdata[c]);
           }
           TurtleApp.drawTable();
       },
       alert, /*On Failure*/
       null /*Sends no data*/
       );
};
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*Onloads Here*/
TurtleApp.getAllFromFirebase();
/*Seeds*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/