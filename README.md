<h1 style="font-size: 56px">veco</h1>
a very simple and archaic version control CLI tool created for learning purposes, <br />
not meant to replace any existing version control technologies. Do not contribute.

## table of contents

- [usage](https://github.com/alperenozdnc/veco)
- [how it works](https://github.com/alperenozdnc/veco)
- [license](https://github.com/alperenozdnc/veco)

## usage

### veco help
Lists all the commands and their purposes.

### veco create [project/ignore/change]
The ultimate command for any kind of creation action.

<br />

```
veco create project [path]
```

Creates a veco project in given path, assumes `.` if none provided.

<br />

```
veco create ignore [path1] [path2] [path3]...
```

Ignores given paths on any filesystem operation.

<br />

```
veco create change {-M, msg, --message} [message] {-D, desc, --dsescription} [description]
```

Accumulates all focused diffs into a change and records it.

### veco delete [project/diff/ignore]
The ultimate command for any kind of deletion action.

<br />

```
veco delete project
```

Deletes the current veco project in path.

<br />

```
veco delete diff
```

Undoes any diffs that didn't make it into a change yet.

<br />

```
veco delete ignore [path1] [path2] [path3]...
```

Unignores given paths on any filesystem operation.

### veco view [ignores/changes/diff]
The ultimate command for any kind of viewing action.

<br />

```
veco view ignores 
```

Lists all ignores.

<br />

```
veco view changes
```

Lists every change with their respective dates and gives option to view every operation, or revert back to that change

<br />

```
veco view diff [all/focused-only/unfocused-only]
```
Lists any, only focused, or only unfocused diffs that didn't make it into a change.

### veco focus [[path]/list/clean/remove]
The command to manipulate which files are in or not in focus.

<br />

```
veco focus [path1] [path2] [path3]...
```

Puts all inputted paths on focus. A file being in focus means it will be included in changes.

<br />

```
veco focus list
```

Lists all focused paths.

<br />

```
veco focus clean
```
Cleans all focused paths.

<br />

```
veco focus remove [path1] [path2] [path3]...
```

Puts all inputted paths out of focus. A file being in out of focus means it will NOT be included in changes.

### veco revert
Does the same thing as running `veco view changes` and selecting something and reverting to it, but there is no list and an ID must be specified.

<br />

```
veco revert [ID]
```

Reverts the filesystem to change with the id `ID`

## how it works

## license
the code may be distributed, copied, and deleted <br /> over the GPLv3 license. see [LICENSE](https://github.com/alperenozdnc/veco/blob/master/LICENSE) file for details.
