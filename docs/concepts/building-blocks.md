---
sidebar_position: 2
---

# Building Blocks: Lego Bricks

**Synap provides the bricks. You build the castle.**

## The Philosophy

Most productivity apps give you a pre-built house. It has a kitchen, a bedroom, and a garage. If you want a second kitchen or a yoga studio, you can't have one because the architect didn't plan for it.

Synap is different. We give you **Lego bricks** (Entities) and **Instruction Manuals** (Views). You can build a house, a spaceship, a castle, or a robot.

---

## 🧱 The Bricks: Entities

**Entities** are the fundamental data objects in your system. They are the "atoms" of your knowledge base.

An entity is not just a row in a database; it's a strongly-typed object that exists in the Knowledge Graph.

### Common Entity Types:
- **📝 Note**: A piece of text content
- **✅ Task**: An actionable item with status
- **👤 Person**: A contact or profile
- **📅 Event**: Something with a start and end time
- **📁 Project**: A container for other entities
- **🏢 Company**: An organization

### Why "Bricks"?
Because they are **composable** and **interconnected**. 
- A `Task` can belong to a `Project`.
- A `Person` can be assigned to a `Task`.
- A `Note` can mention a `Company`.

Unlike rigid apps where a "Task" lives in the "To-Do List" and a "Note" lives in the "Notebook", in Synap, **Entities live in the Graph**. They don't have a fixed location until you view them.

---

## 🖼️ The Manuals: Views

**Views** are the windows through which you interact with your bricks. They are the "lenses" that organize and display your data.

A View is simply a **Query** + **Layout**.

### Common View Types:
- **📋 Table**: Good for structured data (Tasks, CRM)
- **🪜 Kanban**: Good for status workflows (Projects)
- **📄 List**: Good for simple itemization (Shopping list)
- **🕸️ Graph**: Good for exploring connections (Relationship mapping)
- **📅 Calendar**: Good for time-based data (Schedule)
- **📝 Document**: Good for long-form writing (Wiki, Journal)

### The Power of Decoupling
Because Views are separate from Entities, you can view the **same data** in **multiple ways** simultaneously:

1. View your **Tasks** as a **List** today to check them off.
2. View the *same* **Tasks** as a **Kanban** board to manage workflow.
3. View the *same* **Tasks** on a **Calendar** to see deadlines.
4. View the *same* **Tasks** on a **Graph** to see who is working on what.

If you update a task in the Calendar, it updates in the List, Kanban, and Graph instantly. **One Truth, Many Views.**

---

## 🏗️ The Castle: Workspaces

**Workspaces** are where you arrange your Views to create a specific "App Experience."

A Workspace is a collection of Views tailored for a specific context.

### Examples of What You Can Build:

#### 1. The "Project Manager" Workspace
- **View 1**: Kanban board of Active Projects
- **View 2**: Calendar of Deadlines
- **View 3**: Table of Team Members

#### 2. The "Second Brain" Workspace
- **View 1**: Graph view of all Notes
- **View 2**: List of "Inbox" ideas
- **View 3**: Document view for current writing

#### 3. The "CRM" Workspace
- **View 1**: Table of Contacts filtered by "Lead"
- **View 2**: List of recent interactions
- **View 3**: Kanban of Sales Pipeline

---

## 🧩 Putting It Together

Imagine you want to build a **Personal CRM**:

1. **Step 1: The Bricks**  
   You create `Person` entities for your contacts and `Meeting` entities for your interactions.

2. **Step 2: The Logic**  
   You link them: `Meeting` *with* `Person`.

3. **Step 3: The Views**  
   - Create a **Table View** to list all People, showing columns for "Last Contacted" and "Company".
   - Create a **Calendar View** to show all Meetings.

4. **Step 4: The Workspace**  
   Group these views into a "Network" workspace.

**Result**: You just "built" a CRM app without writing a line of code. That is the power of Synap.
