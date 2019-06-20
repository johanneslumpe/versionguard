# 🔐 Versionguard

**Diverging core dependencies between multiple applications are a thing of the past! Versionguard is here to protect your applications from out of sync dependencies - on your terms!**

## 📋 Features
- 🎉 Manage blessed dependency versions across multiple applications with ease
- 📋 Multiple application groups with multiple dependency sets for tailored version governance
- ⏰ Grace periods allow for staggered upgrading
- 🚦 Tiered version checking: pass, tentantive pass and fail
- ⚡️ Automatically fail builds on CI when dependencies are out of date

![Basic workflow](https://johanneslumpe.github.io/versionguard/assets/00_full-basic-flow.svg "Basic workflow")

## 📖 Available Commands

### Version Checking

#### `check`
![Running a version check](https://johanneslumpe.github.io/versionguard/assets/05_check.svg "Running a version check")
This command is at the heart of version guard. It will ensure that none of your applications diverge from the allowed ranges for registered dependencies. When your dependencies do not satify the requirements the CLI will exit with a non-zero exit code. This is useful if you'd for example like to automatically fail builds on CI. Explore all commands below to learn how to set up a configuration which you can use with `check`.

### Groups

#### `groups:add <groupname>`
![Adding a group](https://johanneslumpe.github.io/versionguard/assets/01_add-group.svg "Adding a group")
This commands lets you add a group to your config file. A group is the basic building block of a versionguard config. It contains your applications and your dependency sets. A version check can be run on a group as a single unit.

#### `groups:remove <groupname>`
![Groups remove](https://johanneslumpe.github.io/versionguard/assets/13_group-remove.svg "Groups remove")
In the same way that you can add groups, you can remove them as well!

#### `groups:rename <oldname> <newname>`
![Groups rename](https://johanneslumpe.github.io/versionguard/assets/10_group-rename.svg "Groups rename")
Want to rename a group? Sure we can do that! The above command will allow you to rename your group to anything you want, given that the new name isn't taken yet by another group.

#### `groups:list`
![Groups list](https://johanneslumpe.github.io/versionguard/assets/08_groups-list.svg "Groups list")
If you forgot which groups you have added to versionguard, `groups:list` is your friend and will gladly list them for you!

#### `groups:info <groupname>`
![Group info](https://johanneslumpe.github.io/versionguard/assets/09_group-info.svg "Group info")
More detailed information about a group, e.g. applications added and available dependency sets can be retrieved using `groups:info <groupname>`.

### Applications

#### `applications:add <groupname> <applicationpaths..>`
![Adding applications](https://johanneslumpe.github.io/versionguard/assets/02_add-apps.svg "Adding applications")
A group isn't useful without applications added to it. Using this command you can add as many applications as you'd like to a group. The paths need to be relative to your versionguard config file's location and must contain a valid `package.json` file.

#### `applications:remove <groupname> <applicationpaths..>`
![Removing applications](https://johanneslumpe.github.io/versionguard/assets/11_app-remove.svg "Removing applications")
It's sad but sometimes applications are obsolete and then there is no place for them in your versionguard config file anymore. Get rid of them!

### Dependencies

#### `dependencies:create-set <groupname> <setname>`
![Adding a dependency set](https://johanneslumpe.github.io/versionguard/assets/03_add-dep-set.svg "Adding a dependency set")
In addition to applications you will also need to declare at least one dependency set in order to get value out of versionguard. Do that with this command!

#### `dependencies:delete-set <groupname> <setname>`
![Removing a dependency set](https://johanneslumpe.github.io/versionguard/assets/12_dep-set-remove.svg "Removing a dependency set")
If you ever get tired of a dependency set, just remove it!

#### `dependencies:add <groupname> <setname> <dependency>`
![Adding dependencies](https://johanneslumpe.github.io/versionguard/assets/04_add-deps.svg "Adding dependencies")
Without any dependencies in a set, what's the point? You ought to check at least something. Add dependencies using this command. In case the dependency already exists in the set you want to add it to, its version will be updated to whatever the version is you wanted to add. If you rock multiple dependency sets, for example for public and private dependencies, and add a dependency which already exists in another set, versionguard will assist you by asking if you'd like to automatically migrate that dependency.

#### `dependencies:remove <groupname> <setname> <dependency>`
![Removing dependencies](https://johanneslumpe.github.io/versionguard/assets/06_remove-deps.svg "Removing dependencies")
If you or your team decides that it's time for a dependency to be removed that's fine, get rid of it! It was outdated anyway.

#### `dependencies:grace-period <groupname> <setname> <graceperiod>`
![Setting grace periods](https://johanneslumpe.github.io/versionguard/assets/07_set-grace-period.svg "Setting grace periods")
In case you'd like to give yourself and others a bit of leeway until when a dependency needs to be in line with the newly required version, you can use this command to set a grace period. Conversely you can also force people to instantly upgrade by setting a grace period of `0`.

## Options
Apart from the core commands listed above, versionguard also provides some options:

### `--verbose`
If you want verbose output, use this flag. Right now only `check` supports verbose mode.

### `--config-path`
By default, versionguard will search for a config file from the current working directory upwards. If it cannot find a config it will conveniently create one for you. In case you want to reference a config file that is not within a directory in the tree above your working directory, you can use this flag to pass a config file path.

## 📄 License
versionguard is MIT licensed, as found in the [LICENSE][l] file.