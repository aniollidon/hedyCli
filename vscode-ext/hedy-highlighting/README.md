# Hedy highlighting

## About Hedy

[Hedy](https://www.hedy.org/) is a gradual programming language aimed at teaching programming and teaching Python. It
teaches using different levels. The first level just offers printing text and asking for input. This level is meant to
introduce learners to the idea of a programming language, and the environment. From there, Hedy builds up to include
more complex syntax and additional concepts.

Hedy is maintained by the Hedy Foundation (Stichting Hedy).

This extension is maintained by aniollidon who is not related with Hedy team apart from a great admiration for the work
they have done.

## This extension

This extension adds error highlighting and language support for Hedy programming language on Visual Studio Code. It
supports the 17 levels of the language, leaving aside level 18, as it is fully compatible with Python. Code will be
automatically detected from file extensions (_.hy1, _.hy2, ... \*.hy17)

- ⚠️ This extension only supports English keywords.
- ⚠️ Errors will be provided by default in Catalan, an English translation is available  at settings.

### Extension Usage
First create a file with .hy\[LEVEL\] extension. VS Code will highlight and correct your code.

+ You can execute your code with your command line, installing [hedyCli](https://github.com/aniollidon/hedyCli).

+ You can also play with your code at [hedy.org](hedy.org)

+ Or you can preview your Hedy code by clicking preview button that will appear on the right corner.



## Settings

At extension settings, you will be able to change the language. Also, you can disable error underlining and variable
tracking, leaving just the syntax highlighting.
