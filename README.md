# Sticky-notes

Process of solving tasks, issues faced and the way you tackled them should be documented.

Drag and Drop feature

Having not used drag and drop feature before I had to read tutorials on drag and drop feature. The implementation was quite similar to the ones we normally use like click events, but we must assign variables to track the object that is being dragged and the object on which it is being dropped. The API was also made more convenient by use of 'dataTransfer' as it helps to carry data itself in the object the is being carried. I used this feature to store the 'innerHTML' contents of one note element and convenient carry around wherever is is going to be dropped.

Context Menu

Also, not having worked with context menu before. I had guessed that there must be some methods to disable the default context menu and found out that 'e.preventDefault()' would just do that.  



References:
Youtube - tutorials,
StackOverflow,
Google,
Native HTML5 Drag and Drop By Eric Bidelman, "https://www.html5rocks.com/en/tutorials/dnd/basics/"