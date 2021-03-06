(function () {
    /* Singleton design
        for local storage Layer
    */
    var MyStorage = (function () {
        // Instance stores a reference to the Singleton
        var instance;
        function init() {
            // Private methods and variables
            var data;
            if (localStorage.getItem('data')) {
                //localStorage only supports strings.So, using JSON.stringify() and JSON.parse() to convert to string.
                data = JSON.parse(localStorage.getItem('data'));
            } else {
                //if localStorage is empty then we set the variable an empty array
                data = [];
            };

            function setData(data) {
                localStorage.setItem("data", JSON.stringify(data));
            }

            return {
                // Public methods and variables

                getData: function () {
                    return data;
                },
                setData: function (data) {
                    setData(data);
                }
            };
        };
        return {
            getInstance: function () {
                if (!instance) {
                    instance = init();
                }
                return instance;
            }
        };
    })();
    /*Factory design
    for creating many note objects
    */
    var noteFactory = function (title, content) {
        var temp = {};
        temp.title = title;
        temp.content = content;
        temp.getTitle = function () {
            return this.title;
        }
        temp.getContent = function () {
            return this.content;
        }
        return temp;
    }

    
    //variables for data layer
    var storage;
    
    //variables for controller
    var DATA = [];
    
//Data Layer
    var MyData = (function () {
        // Instance stores a reference to the Singleton
        var instance;
        function init() {
            // Private methods and variables
            var DATA = [];

            function setData(data){
                DATA = data;
            }

            function addData(obj) {
                DATA.push(obj);
                saveData();
            }
            function updateData(obj, index) {
                DATA[index] = obj;
                saveData();
            }
            function deleteData(index){
                DATA.splice(index, 1);
                saveData();
            }
            function saveData(){
                storage.setData(DATA);
            }
            return {
                // Public methods and variables
                setData: function(data){
                    setData(data);
                },
                getData: function () {
                    return DATA;
                },
                addData: function (obj) {
                    addData(obj);
                },
                updateData: function (obj, index) {
                    updateData(obj, index);
                },
                deleteData: function(index){
                    deleteData(index);
                },
                getDataById: function(id){
                    return DATA[id];
                }
            };
        };
        return {
            getInstance: function () {
                if (!instance) {
                    instance = init();
                }
                return instance;
            }
        };
    })();

    var html = "<div class=\"modal-container\">\n" +
        "    <section class=\"create-modal\">\n" +
        "        <div class=\"form-group title\">\n" +
        "            <label class=\"sr-only\">Title</label>\n" +
        "            <input id=\"title\" type=\"text\" placeholder=\"Title...\" class=\"form-control\">\n" +
        "        </div>\n" +
        "        <div class=\"form-group\">\n" +
        "            <label class=\"sr-only\">Content</label>\n" +
        "            <textarea id=\"content\" type=\"text\" placeholder=\"Content...\" class=\"form-control\"></textarea>\n" +
        "        </div>\n" +
        "        <div class=\"form-group action-btn\">\n" +
        "            <button class=\"btn btn-primary \" id='cancel-button'>Cancel</button>\n" +
        "            <button class=\"btn btn-primary\" id='save-button'>Save</button>\n" +
        "        </div>\n" +
        "    </section>\n" +
        "</div>";

    var myData;


    var noteList; //contains all elements with class attribute = note
    var noteContainer = document.querySelector(".note-container");

    //variables for context menu
    var noteItemClassName = 'note';
    var menu = document.querySelector("#context-menu");
    var menuState = 0;
    var activeClassName = "context-menu--active";
    var menuPosition;
    var menuPositionX;
    var menuPositionY;
    var currentElementId;
    //variables for drag and drop feature
    var draggedElement = null;
    var draggedElementInnerHTML = null;

    //loads data from localstorage to variable DATA
    function loadNotes() {
      myData.setData(storage.getData());
    }

    //to determine if right clicked element is the element we are concerned with adding custom context menu
    function clickInsideElement(e, className) {
        var el = e.srcElement //extracting right clicked element
        //check if element has class attribute 'note', if not then the element doesn't require our custom context menu
        if (el.classList.contains(className)) {
            return el;
        } else {
            while (el = el.parentNode) {
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }

        return false;
    }
    //for determining the position of right click context menu
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }

    //adding listener for our context menu in our document    
    function contextListener() {
        document.addEventListener("contextmenu", function (e) {
            //check if element has class attribute 'note'
            if (clickInsideElement(e, noteItemClassName)) {
                e.preventDefault();
                //display context menu
                toggleMenuOn();
                positionMenu(e);
                //extracting element id regardless of where user clicks in the target
                if(e.path[1].id){
                    currentElementId = e.path[1].id;
                }
                else{
                    currentElementId = e.path[2].id;
                }
                
                console.log(currentElementId);
                
            } else {
                //don't display context menu
                toggleMenuOff();
            }
        });
    }

    function toggleMenuOn() {
        if (menuState !== 1) {
            menuState = 1;
            //display our custom context menu by applying class configured with css
            menu.classList.add(activeClassName);

        }
    }
    function toggleMenuOff() {
        if (menuState !== 0) {
            menuState = 0;
            //remove our custom context menu by applying class configured with css
            menu.classList.remove(activeClassName);
        }
    }
    //if user left clicks anywhere then turn our context menu off, if user clicks on note element we pop up update box 
    function clickListener() {
        document.addEventListener("click", function (e) {

            var button = e.which || e.button;
            if (button === 1) {
                toggleMenuOff();
            }
            if (clickInsideElement(e, noteItemClassName)) {
                e.preventDefault();
                //display context menu
                toggleMenuOff();
                positionMenu(e);
                if(e.path[1].id){
                    currentElementId = e.path[1].id;
                }
                else{
                    currentElementId = e.path[2].id;
                }
                
                onUpdateNoteClick();
            }
        });
    }

    //listener for delete button which pops up after context menu    
    function deleteListener() {
        var deleteButton = document.getElementById('delete-button');
        deleteButton.addEventListener('click', function (e) {
            loadNotes()
            //currentElementId is previously set by our context listener when we right click the note element
            myData.deleteData(currentElementId);
            clearNotes();
            renderNotes();
            dragAndDropListener();
        });
    }

    //adding drag and drop listenere to note elements
    function dragAndDropListener() {
        if (document.querySelectorAll(".note")) {
            noteList = document.querySelectorAll(".note");
        };
        [].forEach.call(noteList, function (ele) {
            ele.addEventListener('dragstart', onDragStart, false);
            ele.addEventListener("dragenter", function (e) {
                e.preventDefault();
            }, false);
            ele.addEventListener("dragover", function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                this.classList.add('over');
            }, false);
            ele.addEventListener('dragleave', function (e) {
                e.preventDefault();
                this.classList.remove('over');
            }, false);
            ele.addEventListener("drop", onDrop, false);
            ele.addEventListener('dragend', function (e) {
                e.preventDefault();
            }, false);
        });

    }
    function onDragStart(e) {
        currentElementId = e.path[0].id;
        e.dataTransfer.setData('innerHTML', this.innerHTML);
        draggedElement = this;

    }
    function onDrop(e) {
        var droppedElementId;
        if (e.path[1].id == '') {
            droppedElementId = e.path[2].id;
        }
        else {
            droppedElementId = e.path[1].id;
        };

        this.classList.remove('over');
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        //dragged element can't be dropped on itself
        if (draggedElement != this) {
            //innerHTML of drop element is assignment to this drag element
            draggedElement.innerHTML = this.innerHTML;
            //innerHTML of drag element is assignment to this drop element
            this.innerHTML = e.dataTransfer.getData('innerHTML');
            
            var dropData = myData.getDataById(droppedElementId);
            console.log(dropData);
            var dragData = myData.getDataById(currentElementId);
            myData.updateData(dragData,droppedElementId);
            myData.updateData(dropData,currentElementId);
            currentElementId = null;
            loadNotes();
        }
    }
    function positionMenu(e) {
        menuPosition = getPosition(e);
        menuPositionX = (menuPosition.x - 60) + "px";
        menuPositionY = (menuPosition.y - 70) + "px";
        menu.style.left = menuPositionX;
        menu.style.top = menuPositionY;
    }

    function clearNotes() {
        var noteListId = document.querySelector('#note-list');
        console.log(noteListId);
        noteContainer.removeChild(noteListId);

    }
    function renderNotes() {
        var DATA = myData.getData();
        if (DATA == null) {
            return;
        }
        var div = document.createElement("div");
        div.setAttribute('id', 'note-list');
        for (var i = 0; i < DATA.length; i++) {
            //css not wokring with insertAdjacentHTML so creating DOM

            var li = document.createElement("li");
            li.setAttribute('class', 'note');
            li.setAttribute('id', i);
            li.setAttribute('draggable', 'true');
            var a = document.createElement("a");
            var h2 = document.createElement("h2");
            h2.innerHTML = DATA[i].title;
            var p = document.createElement("p");
            p.innerHTML = DATA[i].content;
            a.appendChild(h2);
            a.appendChild(p);
            li.appendChild(a);
            div.appendChild(li);
        }
        noteContainer.insertAdjacentElement('beforeend', div);
    }

    function onUpdateNoteClick() {
        document.getElementById('modal-container').innerHTML = html;
        document.getElementById('cancel-button').addEventListener('click', function () {
            document.getElementById('modal-container').innerHTML = "";
        });
        document.getElementById('title').value = myData.getDataById(currentElementId).title;
        document.getElementById('content').value = myData.getDataById(currentElementId).content;
        document.getElementById('save-button').addEventListener('click', function () {
            // console.log(currentElementId);
            var title = document.getElementById('title').value;
            var content = document.getElementById('content').value;
            var updateNote = {
                'title': title,
                'content': content
            };
            myData.updateData(updateNote, currentElementId);
            
            //refreshing presentation layer by deleting old and creating new note list
            clearNotes();
            renderNotes();
            //adding drag and drop listener to note elements
            dragAndDropListener();
            document.getElementById('modal-container').innerHTML = "";
        });

    }
    function onCreateNoteClick() {
        document.getElementById('modal-container').innerHTML = html;
        document.getElementById('cancel-button').addEventListener('click', function () {
            document.getElementById('modal-container').innerHTML = "";
        });
        document.getElementById('save-button').addEventListener('click', function () {

            var title = document.getElementById('title').value;
            var content = document.getElementById('content').value;
            var newNote = {
                'title': title,
                'content': content
            };
            myData.addData(newNote);
            //refreshing presentation layer by deleting old and creating new note list
            clearNotes();
            renderNotes();
            //adding drag and drop listener to note elements
            dragAndDropListener();
            document.getElementById('modal-container').innerHTML = "";
        });

    }

    function main() {
        //initialize storage layer
        storage = MyStorage.getInstance();
        //initialize data layer
        myData = MyData.getInstance();
        //get data from storage layer and put it in data layer
        loadNotes();
        //register various listeners
        contextListener();
        clickListener();
        document.getElementById('add-note').addEventListener('click', onCreateNoteClick);
        renderNotes();
        deleteListener();
        dragAndDropListener();
       
        console.log(myData.getData());
    }
    main();
})();