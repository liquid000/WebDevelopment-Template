# WebDevelopment-Template


## Setup Environment

1. clone master repository

        git clone git@github.com:liquid000/WebDevelopment-Template.git

2. in clone root directory

3. install packages

        npm install

4. init eslint setting

        eslint --init
        
5. setting autoprefixer in package-json(under the devDependencies object) and input versions to apply

   -example

        "browserslist": [
          "last 2 versions", "ie >= 11", "Android >= 4"
         ]


## Usage

・start gulp tasks

    gulp

・Check your auto tasks

    gulp --tasks
