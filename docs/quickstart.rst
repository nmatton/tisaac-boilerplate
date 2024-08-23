==========
Quickstart
==========

This page provides a quick introduction to the basic concepts of the boilerplate and how to use it.

Installation
------------

Installing the boilerplate involves adding it to your BGA project. 
Follow these steps to install the boilerplate:

1. Create your project on BGA Studio as you would for any other project.
2. Copy the `setup.sh` file from the boilerplate to the root of your project. You can `download it here <https://raw.githubusercontent.com/nmatton/tisaac-boilerplate/update_and_document/setup.sh>`_ (available in the repository).
3. Run the `setup.sh` file in your terminal. This will replace the default BGA files with the boilerplate files in your project.

Usage
-----

The boilerplate is designed to serve as a base template for implementing games on the Board Game Arena (BGA) platform.
All the framework provided by BGA is still available and can be used in conjunction with the boilerplate.

The boilerplate includes modules for both JavaScript and PHP. Below is a brief overview of the modules included:

- **JavaScript**: The JavaScript module primarily consists of the ``Core`` and ``Player`` modules.

  - The ``Core`` module contains essential functions for the frontend, including basic animations, helper functions, and more.
  - The ``Player`` module offers functions to interact with player data, such as retrieving the player's color, name, and managing player-specific templates.

- **PHP**: The PHP module includes ``Globals``, ``Preferences``, ``DB_Manager`` (with cache), and other modules that enhance efficiency and clarity in implementation. This is the more advanced part of the boilerplate, designed to better structure your code and simplify game development.

  - The ``Globals`` module is used to store variables of any type in the database. It closely resembles the official "Globals" module released by BGA (mid-2024), with added features like casting, type checking, and the use of Magic Methods.
  - The ``Preferences`` module is a wrapper that utilizes the newly released "Preferences" module by BGA (mid-2024) and adds a local storage preference system.
  - The ``DB_Manager`` module is actually a set of modules that includes a ``QueryBuilder`` and a ``Collection`` class. The ``QueryBuilder`` class is used to build SQL queries in a more object-oriented way, and the ``Collection`` class is used to manipulate the results of these queries.
  - An additional abstraction layer provided by the ``Pieces`` module enables a more object-oriented approach to game pieces, featuring a "Manager/Models" system.

- **CLI**: Some CLI tools are also included, such as scripts for multiple developers working on the same project or syncing CSS.
