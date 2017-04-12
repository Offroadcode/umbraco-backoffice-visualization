# Umbraco Backoffice Visualization Package

The Umbraco Backoffice Visualization package is a dashboard that displays visual representations of how data in Umbraco intersects. Located in the Settings section, version 1 has the purpose of mapping DocType connections via inheritance and compositions.

[You can view the demo here](https://www.youtube.com/watch?v=pmRFipRIfCA).

<img src="https://docs.google.com/uc?id=0B1BeRPYxbA_SeE1lNGYtSkszTEk&export=download" width="285" title="DocType Composition Relationships Landing" /> <img src="https://docs.google.com/uc?id=0B1BeRPYxbA_SZDVVZ1oweW55WDg&export=download" width="285" title="DocType Composition Relationships Table" /> <img src="https://docs.google.com/uc?id=0B1BeRPYxbA_SRmV6SjNJQlpFTGc&export=download" width="285" title="DocType Compostion Relationships, Showing All DocTypes" />

#### Change Log

##### 1.0.0

* Initial Release

## Download for Umbraco

Install the selected release through the Umbraco package installer or download and install locally from Our.

## Contribute

Want to contribute to the Backoffice Visualisation package? You'll want to use Grunt (our task runner) to help you integrate with a local copy of Umbraco.

### Install Dependencies
*Requires Node.js to be installed and in your system path*

    npm install -g grunt-cli && npm install -g grunt
    npm install

### Build
    grunt

Builds the project to /dist/. These files can be dropped into an Umbraco 7 site, or you can build directly to a site using:

    grunt --target="D:\inetpub\mysite"

You can also watch for changes using:

    grunt watch
    grunt watch --target="D:\inetpub\mysite"

To build the actual Umbraco package, use:

    grunt umbraco
