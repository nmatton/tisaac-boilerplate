.. Tisaac's boilerplate documentation master file, created by
   sphinx-quickstart on Tue Aug 20 14:54:35 2024.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

.. Add your content using ``reStructuredText`` syntax. See the
   `reStructuredText <https://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html>`_
   documentation for details.

Tisaac's Boilerplate Documentation
==================================

Welcome to Tisaac's Boilerplate Documentation!

Tisaac's boilerplate is a base template for implementing games on the Board Game Arena (BGA) platform.
If you are unfamiliar with the BGA framework, please refer to the 
`BGA Studio documentation <https://en.doc.boardgamearena.com/Studio>`_. Learning the framework solely from this documentation is *not* recommended.

What's Included?
================

This boilerplate includes a variety of utilities and provides the foundation for using Object-Oriented Programming (OOP) concepts in PHP. 
You will find modules for both JavaScript and PHP.

The **JavaScript** module primarily consists of the ``Core`` and ``Player`` modules. 
The ``Core`` module contains essential functions for the frontend, including basic animations, helper functions, and more. 
The ``Player`` module offers functions to interact with player data, such as retrieving the player's color, name, and managing player-specific templates.

The **PHP** module includes ``Helpers``, ``QueryBuilder``, ``DB_Managers``, ``DB_Models``, and other modules that enhance efficiency and clarity in implementation. 
This is the more advanced part of the boilerplate, designed to help better structure your code and simplify game development in various aspects.

Some **CLI** tools are also included such as scripts to work at multiple developpers on the same project.

Where to Start?
===============

The best place to start is by reading the `quickstart <quickstart.html>`_ page, which will introduce you to the basic concepts of the boilerplate and how to use it. 
The `overview <overview.html>`_ will provide a general understanding of the boilerplate, its components, and how they are organized.
Finally, the `tutorial <tutorial.html>`_ section will walk you through the implementation of a simple game using the boilerplate.

If you are more advanced or familiar with the boilerplate, you can jump directly to the `API Reference <api/apiref.html>`_.


.. toctree::
   :glob:
   :maxdepth: 2
   :caption: Contents:
   
   quickstart
   overview
   tutorial
   jsmodules/main
   phpmodules/main
   api/apiref