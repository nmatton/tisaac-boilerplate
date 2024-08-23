# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = "Tisaac's boilerplate"
copyright = '2024, Tisaac, nicotacotac, other(s)'
author = 'Tisaac, nicotacotac, other(s)'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    "myst_parser",
    "sphinx.ext.doctest",
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    "sphinx.ext.intersphinx",
    'sphinx_rtd_theme',
    'sphinxcontrib.phpdomain',
    'sphinx_js']

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

# -- Setup for PHP formatting ------------------------------------------------
from sphinx.highlighting import lexers
from pygments.lexers.web import PhpLexer
lexers['php'] = PhpLexer(startinline=True, linenos=1)
lexers['php-annotations'] = PhpLexer(startinline=True, linenos=1)

# -- Setup for JS formatting ------------------------------------------------
root_for_relative_js_paths = '../modules/'
js_source_path = ['../modules/js/Core', '../modules/js']
