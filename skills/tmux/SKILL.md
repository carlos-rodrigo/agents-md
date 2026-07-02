---
name: tmux
description: Instructions for using tmux to spawn multiple processes, inspect them, and capture their output. Useful for running servers or long-running tasks in the background.
allowed-tools: Bash
---

# Tmux Skill

This skill empowers you to manage multiple concurrent processes (like servers, watchers, or long builds) using `tmux` directly from the `Bash` tool.

Since you are likely already running inside a tmux session, you can spawn new windows or panes to handle these tasks without blocking your main communication channel.

## 1. Verify Environment & Check Status

First, verify you are running inside tmux:

```bash
echo $TMUX
```

If this returns empty, either start/attach a tmux session first or create a detached session with `tmux new-session -d -s <session>`. Prefer running background jobs from an existing Pi/tmux session when possible.

Once verified, check your current windows:

```bash
tmux list-windows
```

## 2. Spawn a Background Process

To run a command (e.g., a dev server) in a way that persists and can be inspected:

1.  **Create a new detached window** with a unique name. Include the task/purpose to avoid collisions, e.g. `pi-api-server` or `pi-loop-task-002`.

    ```bash
    tmux new-window -n "pi-api-server" -d
    ```

2.  **Send the command** to that window.
    ```bash
    tmux send-keys -t "pi-api-server" "npm start" C-m
    ```
    _(`C-m` simulates the Enter key)_

## 3. Inspect Output (Read Logs)

You can read the output of that pane at any time without switching your context.

**Get the current visible screen:**

```bash
tmux capture-pane -p -t "pi-api-server"
```

**Get the entire history (scrollback):**

```bash
tmux capture-pane -p -S - -t "pi-api-server"
```

_Use this if the output might have scrolled off the screen._

## 4. Interact with the Process

If you need to stop or restart the process:

**Send Ctrl+C (Interrupt):**

```bash
tmux send-keys -t "pi-api-server" C-c
```

**Kill the window (Clean up):**

```bash
tmux kill-window -t "pi-api-server"
```

## 5. Optional: Chaining Commands

Default to the simple two-step commands above for clarity. You can chain multiple tmux commands in a single invocation using `';'` when the command is already proven.

Example: Create window and start process in one go:

```bash
tmux new-window -n "pi-api-server" -d ';' send-keys -t "pi-api-server" "npm start" C-m
```

## Summary of Pattern

1. `tmux new-window -n "pi-{task}-{purpose}" -d`
2. `tmux send-keys -t "pi-{task}-{purpose}" "CMD" C-m`
3. `tmux capture-pane -p -S - -t "pi-{task}-{purpose}"`
4. Capture logs before `tmux kill-window -t "pi-{task}-{purpose}"`
