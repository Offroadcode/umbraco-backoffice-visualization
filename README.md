# Umbraco Backoffice Visualization Package
An Umbraco package that visualizes data for the back office such as DocTypes.

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