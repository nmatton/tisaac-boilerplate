modal
=====

.. js:autoattribute:: CONFIG

Here is the configuration object for the modal:

.. code-block:: javascript

    - container (string): The container element ID where the modal will be appended.
    - class (string): The CSS class name for the modal.
    - autoShow (boolean): Determines whether the modal should be automatically shown when created.
    - modalTpl (string): The HTML template for the modal.
    - closeIcon (string): The CSS class name for the close icon. Set to null if no icon is needed.
    - closeIconTpl (string): The HTML template for the close icon.
    - closeAction (string): The action to be performed when the close icon or underlay is clicked. Can be 'destroy' or 'hide'.
    - closeWhenClickOnUnderlay (boolean): Determines whether the modal should be closed when the underlay is clicked.
    - helpIcon (string): The CSS class name for the help icon. Set to null if no icon is needed.
    - helpLink (string): The link URL for the help icon.
    - helpIconTpl (string): The HTML template for the help icon.
    - title (string): The title of the modal. Set to null if no title is needed.
    - titleTpl (string): The HTML template for the title.
    - contentsTpl (string): The HTML template for the contents of the modal.
    - contents (string): The contents of the modal.
    - verticalAlign (string): The vertical alignment of the modal. Can be 'top', 'center', or 'bottom'.
    - animationDuration (number): The duration of the modal animation in milliseconds.
    - fadeIn (boolean): Determines whether the modal should fade in when shown.
    - fadeOut (boolean): Determines whether the modal should fade out when hidden.
    - openAnimation (boolean): Determines whether the modal should have an open animation.
    - openAnimationTarget (string): The target element ID for the open animation.
    - openAnimationDelta (number): The delta value for the open animation.
    - onShow (function): The callback function to be executed when the modal is shown.
    - onHide (function): The callback function to be executed when the modal is hidden.
    - statusElt (string): The element ID to add/remove the "opened" class on.
    - scale (number): The scale value for the modal.
    - breakpoint (number): The breakpoint value for auto resizing the modal.
    - vscale (number): The vertical scale value for the modal.
    - vbreakpoint (number): The vertical breakpoint value for auto resizing the modal.


.. js:autofunction:: constructor

.. js:autofunction:: isDisplayed

.. js:autofunction:: isCreated

.. js:autofunction:: create

.. js:autofunction:: adjustSize

.. js:autofunction:: getOpeningTargetCenter

.. js:autofunction:: fadeInAnimation

.. js:autofunction:: show

.. js:autofunction:: fadeOutAnimation

.. js:autofunction:: hide

.. js:autofunction:: kill

