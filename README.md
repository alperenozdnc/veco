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

## how it works

## license
the code may be distributed, copied, and deleted <br /> over the GPLv3 license. see [LICENSE](https://github.com/alperenozdnc/veco/blob/master/LICENSE) file for details.
