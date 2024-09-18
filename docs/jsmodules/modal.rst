Modal Module
============

The modal component provides a way to display pop-up dialogs or windows within the game inteface.
It can be used for various purposes such as showing alerts, confirmations, forms, or any other content that needs to temporarily overlay the game.


Key Features:
    - Customizable appearance and behavior
    - Fade-in and fade-out animations
    - Opening animation from a target element
    - Responsive design with auto-scaling
    - Close button and optional help button
    - Ability to close by clicking on the underlay
    - Event hooks for show and hide actions

Usage
-----

The modal component is included by default in the boilerplate as the setting modal already use it.

To create a new modal window, you just need to create a new instance of the ``customgame.modal`` class.
Its constructor takes two arguments: the modal's ID and a configuration object.

Example:

.. code-block:: js
    
        this._discardModal = new customgame.modal('showDiscard', {
            class: 'foo_popin',
            closeIcon: 'fa-times',
            title: _('Previous Cards in discard pile'),
            closeAction: 'hide',
            verticalAlign: 'flex-start',
            contentsTpl: `<div id='dicard-pile'></div>`,
        });
    
The modal is highly configurable through a ``CONFIG`` object, which defines default values for various options. These can be overridden when creating a new modal instance.

Key Methods:

    - ``constructor(id, config)``: Creates a new modal instance
    - ``show()``: Displays the modal with animations
    - ``hide()``: Hides the modal without destroying it
    - ``destroy()``: Hides and then removes the modal from the DOM

Modal Configuration
~~~~~~~~~~~~~~~~~~~

**container**: *(String)*  
    **Default**: `'ebd-body'`  
    The ID of the container element where the modal will be appended.

**class**: *(String)*  
    **Default**: `'custom_popin'`  
    The CSS class name applied to the modal for styling.

**autoShow**: *(Boolean)*  
    **Default**: `false`  
    If `true`, the modal will automatically show when created.

**modalTpl**: *(String)*  
    A template string for the modal's HTML structure.

    **Default**:  

    .. code-block:: html

        <div id='popin_\${id}_container' class="\${class}_container">
            <div id='popin_\${id}_underlay' class="\${class}_underlay"></div>
                <div id='popin_\${id}_wrapper' class="\${class}_wrapper">
                <div id="popin_\${id}" class="\${class}">
                    \${titleTpl}
                    \${closeIconTpl}
                    \${helpIconTpl}
                    \${contentsTpl}
                </div>
            </div>
        </div>

**closeIcon**: *(String)*  
    **Default**: `'fa-times-circle'`  
    The CSS class for the close icon. Set to `null` to omit the close icon.

**closeIconTpl**: *(String)*  
    HTML template for the close icon.

    **Default**:

    .. code-block:: html

        <a href="#" id="popin_${id}_close" class="${class}_closeicon">
            <i class="fa ${closeIcon} fa-2x" aria-hidden="true"></i>
        </a>

**closeAction**: *(String)*  
    **Default**: `'destroy'`  
    Action to perform when closing (`'destroy'` or `'hide'`).

**closeWhenClickOnUnderlay**: *(Boolean)*  
    **Default**: `true`  
    If `true`, clicking the underlay will close the modal.

**helpIcon**: *(String)*  
    **Default**: `null`  
    CSS class for the help icon. Set to `null` to omit the help icon.

**helpLink**: *(String)*  
    **Default**: `'#'`  
    URL for the help icon link.

**helpIconTpl**: *(String)*  
    HTML template for the help icon.

    **Default**:

    .. code-block:: html

        <a href="${helpLink}" target="_blank" id="popin_${id}_help" class="${class}_helpicon">
            <i class="fa ${helpIcon} fa-2x" aria-hidden="true"></i>
        </a>

**title**: *(String)*  
    **Default**: `null`  
    Modal title. Set to `null` for no title.

**titleTpl**: *(String)*  
    HTML template for the title.

    **Default**:

    .. code-block:: html

        <h2 id="popin_${id}_title" class="${class}_title">${title}</h2>

**contentsTpl**: *(String)*  
    HTML template for the modal contents.

    **Default**:

        .. code-block:: html

            <div id="popin_\${id}_contents" class="\${class}_contents">
                \${contents}
            </div>

**contents**: *(String)*  
    **Default**: `''`  
    The content of the modal.

**verticalAlign**: *(String)*  
    **Default**: `'center'`  
    Vertical alignment of the modal (`'top'`, `'center'`, `'bottom'`).

**animationDuration**: *(Number)*  
    **Default**: `500`  
    Duration of animations in milliseconds.

**fadeIn**: *(Boolean)*  
    **Default**: `true`  
    If `true`, the modal fades in when shown.

**fadeOut**: *(Boolean)*  
    **Default**: `true`  
    If `true`, the modal fades out when hidden.

**openAnimation**: *(Boolean)*  
    **Default**: `false`  
    If `true`, enables an opening animation.

**openAnimationTarget**: *(String)*  
    **Default**: `null`  
    ID of the element from which the opening animation starts.

**openAnimationDelta**: *(Number)*  
    **Default**: `200`  
    Additional time for the opening animation.

**onShow**: *(Function)*  
    **Default**: `null`  
    Callback function executed when the modal is shown.

**onHide**: *(Function)*  
    **Default**: `null`  
    Callback function executed when the modal is hidden.

**statusElt**: *(String)*  
    **Default**: `null`  
    ID of an element to add/remove the "opened" class when the modal opens/closes.

**scale**: *(Number)*  
    **Default**: `1`  
    Scale factor for the modal.

**breakpoint**: *(Number)*  
    **Default**: `null`  
    Width breakpoint for auto-resizing.

**vscale**: *(Number)*  
    **Default**: `1`  
    Vertical scale factor.

**vbreakpoint**: *(Number)*  
    **Default**: `null`  
    Height breakpoint for auto-resizing.


Layout
------

To have the same styling as the BGA ones, use the following style :

.. code-block:: css

    .custom_popin {
        position:relative;
        max-width: 1000px;
        min-width: 300px;
        width:70%;
        box-sizing: border-box;
        background: linear-gradient(to bottom, #f8f8f8, #e7e9e8);
        border: 2px black solid;
        border-radius: 8px;
        padding: 1%;
        }
    .mobile_version .custom_popin {
        padding: 10px;
    }
    .custom_popin_title {
        font-size: 150%;
        padding-right: 90px;
    }
    .mobile_version .custom_popin_title {
        font-size: 120%;
    }
    .custom_popin_closeicon,
    .custom_popin_helpicon {
        position: absolute;
        top: 5px;
        color: black !important;
        right: 8px;
        font-size: 134%;
    }
    .custom_popin_helpicon {
        right: 47px;
    }
    .notouch-device .custom_popin_closeicon:hover,
    .notouch-device .custom_popin_helpicon:hover {
        color: #555555 !important;
    }