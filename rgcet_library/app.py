import os
import sqlite3
from datetime import datetime, timedelta
from functools import wraps

from flask import (Flask, flash, g, redirect, render_template, request,
                   session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-me-in-production")

DATABASE = os.path.join(os.path.dirname(__file__), "rgcet_library.db")
LOAN_DAYS = 14
FINE_PER_DAY = 2  # rupees per day


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")

    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT    NOT NULL UNIQUE,
            password    TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            full_name   TEXT    NOT NULL,
            role        TEXT    NOT NULL DEFAULT 'student',
            is_approved INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS books (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            title            TEXT    NOT NULL,
            author           TEXT    NOT NULL,
            isbn             TEXT    UNIQUE,
            category         TEXT,
            total_copies     INTEGER NOT NULL DEFAULT 1,
            available_copies INTEGER NOT NULL DEFAULT 1,
            description      TEXT,
            added_at         TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            book_id     INTEGER NOT NULL REFERENCES books(id),
            issue_date  TEXT    NOT NULL DEFAULT (datetime('now')),
            due_date    TEXT    NOT NULL,
            return_date TEXT,
            status      TEXT    NOT NULL DEFAULT 'issued',
            fine        REAL    NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS book_requests (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id),
            book_title TEXT    NOT NULL,
            author     TEXT,
            reason     TEXT,
            status     TEXT    NOT NULL DEFAULT 'pending',
            created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            book_id     INTEGER NOT NULL REFERENCES books(id),
            rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            review_text TEXT,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS badges (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id),
            badge_name TEXT    NOT NULL,
            earned_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );
    """)

    # Seed a default admin account if none exists
    row = db.execute("SELECT id FROM users WHERE role='admin' LIMIT 1").fetchone()
    if row is None:
        db.execute(
            "INSERT INTO users (username, password, email, full_name, role, is_approved) VALUES (?,?,?,?,?,?)",
            (
                "admin",
                generate_password_hash("admin123"),
                "admin@rgcet.edu",
                "Administrator",
                "admin",
                1,
            ),
        )
    db.commit()
    db.close()


# ---------------------------------------------------------------------------
# Auth decorators
# ---------------------------------------------------------------------------

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            flash("Please log in first.", "warning")
            return redirect(url_for("user_login"))
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get("role") != "admin":
            flash("Admin access required.", "danger")
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    db = get_db()
    total_books = db.execute("SELECT COUNT(*) FROM books").fetchone()[0]
    total_members = db.execute(
        "SELECT COUNT(*) FROM users WHERE role!='admin' AND is_approved=1"
    ).fetchone()[0]
    recent_books = db.execute(
        "SELECT * FROM books ORDER BY added_at DESC LIMIT 6"
    ).fetchall()
    return render_template(
        "index.html",
        total_books=total_books,
        total_members=total_members,
        recent_books=recent_books,
    )


# ---------------------------------------------------------------------------
# Admin auth
# ---------------------------------------------------------------------------

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form["username"].strip()
        password = request.form["password"]
        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE username=? AND role='admin'", (username,)
        ).fetchone()
        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]
            flash("Welcome, Administrator!", "success")
            return redirect(url_for("dashboard"))
        flash("Invalid admin credentials.", "danger")
    return render_template("admin_login.html")


@app.route("/admin/logout")
def admin_logout():
    session.clear()
    flash("Logged out.", "info")
    return redirect(url_for("admin_login"))


# ---------------------------------------------------------------------------
# User auth
# ---------------------------------------------------------------------------

@app.route("/login", methods=["GET", "POST"])
def user_login():
    if request.method == "POST":
        username = request.form["username"].strip()
        password = request.form["password"]
        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE username=? AND role!='admin'", (username,)
        ).fetchone()
        if user and check_password_hash(user["password"], password):
            if not user["is_approved"]:
                flash("Your account is pending admin approval.", "warning")
                return redirect(url_for("user_login"))
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]
            flash(f"Welcome, {user['full_name']}!", "success")
            return redirect(url_for("user_dashboard"))
        flash("Invalid username or password.", "danger")
    return render_template("user_login.html")


@app.route("/logout")
def user_logout():
    session.clear()
    flash("Logged out.", "info")
    return redirect(url_for("index"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"].strip()
        password = request.form["password"]
        email = request.form["email"].strip()
        full_name = request.form["full_name"].strip()
        role = request.form.get("role", "student")
        db = get_db()
        try:
            db.execute(
                "INSERT INTO users (username, password, email, full_name, role) VALUES (?,?,?,?,?)",
                (username, generate_password_hash(password), email, full_name, role),
            )
            db.commit()
            flash("Registration successful! Please wait for admin approval.", "success")
            return redirect(url_for("user_login"))
        except sqlite3.IntegrityError:
            flash("Username or email already exists.", "danger")
    return render_template("register.html")


# ---------------------------------------------------------------------------
# Admin – Dashboard
# ---------------------------------------------------------------------------

@app.route("/admin/dashboard")
@admin_required
def dashboard():
    db = get_db()
    stats = {
        "total_books": db.execute("SELECT COUNT(*) FROM books").fetchone()[0],
        "total_members": db.execute(
            "SELECT COUNT(*) FROM users WHERE role!='admin' AND is_approved=1"
        ).fetchone()[0],
        "issued": db.execute(
            "SELECT COUNT(*) FROM transactions WHERE status='issued'"
        ).fetchone()[0],
        "overdue": db.execute(
            "SELECT COUNT(*) FROM transactions WHERE status='issued' AND due_date < datetime('now')"
        ).fetchone()[0],
        "pending_users": db.execute(
            "SELECT COUNT(*) FROM users WHERE is_approved=0"
        ).fetchone()[0],
        "pending_requests": db.execute(
            "SELECT COUNT(*) FROM book_requests WHERE status='pending'"
        ).fetchone()[0],
    }
    recent_tx = db.execute(
        """SELECT t.*, u.full_name, b.title FROM transactions t
           JOIN users u ON u.id=t.user_id
           JOIN books b ON b.id=t.book_id
           ORDER BY t.issue_date DESC LIMIT 10"""
    ).fetchall()
    return render_template("dashboard.html", stats=stats, recent_tx=recent_tx)


# ---------------------------------------------------------------------------
# Admin – Books
# ---------------------------------------------------------------------------

@app.route("/admin/books")
@admin_required
def books():
    query = request.args.get("q", "").strip()
    db = get_db()
    if query:
        rows = db.execute(
            "SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR category LIKE ?",
            (f"%{query}%", f"%{query}%", f"%{query}%"),
        ).fetchall()
    else:
        rows = db.execute("SELECT * FROM books ORDER BY title").fetchall()
    return render_template("books.html", books=rows, query=query)


@app.route("/admin/books/add", methods=["GET", "POST"])
@admin_required
def add_book():
    if request.method == "POST":
        copies = int(request.form.get("total_copies", 1))
        db = get_db()
        db.execute(
            """INSERT INTO books (title, author, isbn, category, total_copies, available_copies, description)
               VALUES (?,?,?,?,?,?,?)""",
            (
                request.form["title"].strip(),
                request.form["author"].strip(),
                request.form.get("isbn", "").strip() or None,
                request.form.get("category", "").strip(),
                copies,
                copies,
                request.form.get("description", "").strip(),
            ),
        )
        db.commit()
        flash("Book added successfully.", "success")
        return redirect(url_for("books"))
    return render_template("add_book.html")


@app.route("/admin/books/<int:book_id>/edit", methods=["GET", "POST"])
@admin_required
def edit_book(book_id):
    db = get_db()
    book = db.execute("SELECT * FROM books WHERE id=?", (book_id,)).fetchone()
    if book is None:
        flash("Book not found.", "danger")
        return redirect(url_for("books"))
    if request.method == "POST":
        copies = int(request.form.get("total_copies", book["total_copies"]))
        diff = copies - book["total_copies"]
        db.execute(
            """UPDATE books SET title=?, author=?, isbn=?, category=?,
               total_copies=?, available_copies=available_copies+?, description=?
               WHERE id=?""",
            (
                request.form["title"].strip(),
                request.form["author"].strip(),
                request.form.get("isbn", "").strip() or None,
                request.form.get("category", "").strip(),
                copies,
                diff,
                request.form.get("description", "").strip(),
                book_id,
            ),
        )
        db.commit()
        flash("Book updated.", "success")
        return redirect(url_for("books"))
    return render_template("edit_book.html", book=book)


@app.route("/admin/books/<int:book_id>/delete", methods=["POST"])
@admin_required
def delete_book(book_id):
    db = get_db()
    db.execute("DELETE FROM books WHERE id=?", (book_id,))
    db.commit()
    flash("Book deleted.", "info")
    return redirect(url_for("books"))


# ---------------------------------------------------------------------------
# Admin – Members
# ---------------------------------------------------------------------------

@app.route("/admin/members")
@admin_required
def members():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM users WHERE role!='admin' AND is_approved=1 ORDER BY full_name"
    ).fetchall()
    return render_template("members.html", members=rows)


@app.route("/admin/members/<int:user_id>")
@admin_required
def member_detail(user_id):
    db = get_db()
    member = db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if member is None:
        flash("Member not found.", "danger")
        return redirect(url_for("members"))
    history = db.execute(
        """SELECT t.*, b.title FROM transactions t
           JOIN books b ON b.id=t.book_id
           WHERE t.user_id=? ORDER BY t.issue_date DESC""",
        (user_id,),
    ).fetchall()
    badges = db.execute(
        "SELECT * FROM badges WHERE user_id=? ORDER BY earned_at DESC", (user_id,)
    ).fetchall()
    return render_template("member_detail.html", member=member, history=history, badges=badges)


# ---------------------------------------------------------------------------
# Admin – Issue / Return
# ---------------------------------------------------------------------------

@app.route("/admin/issue", methods=["GET", "POST"])
@admin_required
def issue_book():
    db = get_db()
    if request.method == "POST":
        user_id = int(request.form["user_id"])
        book_id = int(request.form["book_id"])
        book = db.execute("SELECT * FROM books WHERE id=?", (book_id,)).fetchone()
        if book["available_copies"] < 1:
            flash("No copies available.", "danger")
            return redirect(url_for("issue_book"))
        due = (datetime.utcnow() + timedelta(days=LOAN_DAYS)).strftime("%Y-%m-%d %H:%M:%S")
        db.execute(
            "INSERT INTO transactions (user_id, book_id, due_date) VALUES (?,?,?)",
            (user_id, book_id, due),
        )
        db.execute(
            "UPDATE books SET available_copies=available_copies-1 WHERE id=?", (book_id,)
        )
        db.commit()
        _award_badge(db, user_id)
        flash("Book issued successfully.", "success")
        return redirect(url_for("transactions"))
    users = db.execute(
        "SELECT * FROM users WHERE role!='admin' AND is_approved=1 ORDER BY full_name"
    ).fetchall()
    books_list = db.execute(
        "SELECT * FROM books WHERE available_copies>0 ORDER BY title"
    ).fetchall()
    return render_template("issue_book.html", users=users, books=books_list)


@app.route("/admin/transactions/<int:tx_id>/return", methods=["POST"])
@admin_required
def return_book(tx_id):
    db = get_db()
    tx = db.execute("SELECT * FROM transactions WHERE id=?", (tx_id,)).fetchone()
    if tx is None or tx["status"] != "issued":
        flash("Transaction not found or already returned.", "warning")
        return redirect(url_for("transactions"))
    now = datetime.utcnow()
    due = datetime.strptime(tx["due_date"], "%Y-%m-%d %H:%M:%S")
    fine = max(0, (now - due).days) * FINE_PER_DAY
    db.execute(
        "UPDATE transactions SET return_date=?, status='returned', fine=? WHERE id=?",
        (now.strftime("%Y-%m-%d %H:%M:%S"), fine, tx_id),
    )
    db.execute(
        "UPDATE books SET available_copies=available_copies+1 WHERE id=?", (tx["book_id"],)
    )
    db.commit()
    if fine:
        flash(f"Book returned. Fine collected: ₹{fine}.", "warning")
    else:
        flash("Book returned successfully.", "success")
    return redirect(url_for("transactions"))


# ---------------------------------------------------------------------------
# Admin – Transactions
# ---------------------------------------------------------------------------

@app.route("/admin/transactions")
@admin_required
def transactions():
    tab = request.args.get("tab", "all")
    db = get_db()
    base = """SELECT t.*, u.full_name, b.title FROM transactions t
              JOIN users u ON u.id=t.user_id
              JOIN books b ON b.id=t.book_id"""
    if tab == "issued":
        rows = db.execute(base + " WHERE t.status='issued' ORDER BY t.issue_date DESC").fetchall()
    elif tab == "returned":
        rows = db.execute(base + " WHERE t.status='returned' ORDER BY t.return_date DESC").fetchall()
    elif tab == "overdue":
        rows = db.execute(
            base + " WHERE t.status='issued' AND t.due_date < datetime('now') ORDER BY t.due_date"
        ).fetchall()
    else:
        rows = db.execute(base + " ORDER BY t.issue_date DESC").fetchall()
    return render_template("transactions.html", transactions=rows, tab=tab)


# ---------------------------------------------------------------------------
# Admin – User management
# ---------------------------------------------------------------------------

@app.route("/admin/users")
@admin_required
def admin_users():
    db = get_db()
    pending = db.execute(
        "SELECT * FROM users WHERE is_approved=0 ORDER BY created_at"
    ).fetchall()
    approved = db.execute(
        "SELECT * FROM users WHERE is_approved=1 AND role!='admin' ORDER BY full_name"
    ).fetchall()
    return render_template("admin_users.html", pending=pending, approved=approved)


@app.route("/admin/users/<int:user_id>/approve", methods=["POST"])
@admin_required
def approve_user(user_id):
    db = get_db()
    db.execute("UPDATE users SET is_approved=1 WHERE id=?", (user_id,))
    db.commit()
    flash("User approved.", "success")
    return redirect(url_for("admin_users"))


@app.route("/admin/users/<int:user_id>/reject", methods=["POST"])
@admin_required
def reject_user(user_id):
    db = get_db()
    db.execute("DELETE FROM users WHERE id=? AND is_approved=0", (user_id,))
    db.commit()
    flash("User rejected and removed.", "info")
    return redirect(url_for("admin_users"))


# ---------------------------------------------------------------------------
# Admin – Book requests
# ---------------------------------------------------------------------------

@app.route("/admin/requests")
@admin_required
def admin_requests():
    db = get_db()
    rows = db.execute(
        """SELECT r.*, u.full_name FROM book_requests r
           JOIN users u ON u.id=r.user_id
           ORDER BY r.created_at DESC"""
    ).fetchall()
    return render_template("admin_requests.html", requests=rows)


@app.route("/admin/requests/<int:req_id>/update", methods=["POST"])
@admin_required
def update_request(req_id):
    status = request.form.get("status", "pending")
    db = get_db()
    db.execute("UPDATE book_requests SET status=? WHERE id=?", (status, req_id))
    db.commit()
    flash(f"Request marked as {status}.", "info")
    return redirect(url_for("admin_requests"))


# ---------------------------------------------------------------------------
# Admin – Reviews
# ---------------------------------------------------------------------------

@app.route("/admin/reviews")
@admin_required
def admin_reviews():
    db = get_db()
    rows = db.execute(
        """SELECT r.*, u.full_name, b.title FROM reviews r
           JOIN users u ON u.id=r.user_id
           JOIN books b ON b.id=r.book_id
           ORDER BY r.created_at DESC"""
    ).fetchall()
    return render_template("admin_reviews.html", reviews=rows)


@app.route("/admin/reviews/<int:review_id>/delete", methods=["POST"])
@admin_required
def delete_review(review_id):
    db = get_db()
    db.execute("DELETE FROM reviews WHERE id=?", (review_id,))
    db.commit()
    flash("Review deleted.", "info")
    return redirect(url_for("admin_reviews"))


# ---------------------------------------------------------------------------
# User portal
# ---------------------------------------------------------------------------

@app.route("/user/dashboard")
@login_required
def user_dashboard():
    db = get_db()
    user_id = session["user_id"]
    active = db.execute(
        """SELECT t.*, b.title, b.author FROM transactions t
           JOIN books b ON b.id=t.book_id
           WHERE t.user_id=? AND t.status='issued'
           ORDER BY t.due_date""",
        (user_id,),
    ).fetchall()
    history = db.execute(
        """SELECT t.*, b.title FROM transactions t
           JOIN books b ON b.id=t.book_id
           WHERE t.user_id=? AND t.status='returned'
           ORDER BY t.return_date DESC LIMIT 10""",
        (user_id,),
    ).fetchall()
    badges = db.execute(
        "SELECT * FROM badges WHERE user_id=? ORDER BY earned_at DESC", (user_id,)
    ).fetchall()
    requests = db.execute(
        "SELECT * FROM book_requests WHERE user_id=? ORDER BY created_at DESC", (user_id,)
    ).fetchall()
    return render_template(
        "user_dashboard.html",
        active=active,
        history=history,
        badges=badges,
        requests=requests,
    )


@app.route("/user/request", methods=["POST"])
@login_required
def submit_request():
    db = get_db()
    db.execute(
        "INSERT INTO book_requests (user_id, book_title, author, reason) VALUES (?,?,?,?)",
        (
            session["user_id"],
            request.form["book_title"].strip(),
            request.form.get("author", "").strip(),
            request.form.get("reason", "").strip(),
        ),
    )
    db.commit()
    flash("Book request submitted.", "success")
    return redirect(url_for("user_dashboard"))


@app.route("/user/review/<int:book_id>", methods=["POST"])
@login_required
def submit_review(book_id):
    db = get_db()
    existing = db.execute(
        "SELECT id FROM reviews WHERE user_id=? AND book_id=?",
        (session["user_id"], book_id),
    ).fetchone()
    if existing:
        flash("You have already reviewed this book.", "warning")
    else:
        db.execute(
            "INSERT INTO reviews (user_id, book_id, rating, review_text) VALUES (?,?,?,?)",
            (
                session["user_id"],
                book_id,
                int(request.form["rating"]),
                request.form.get("review_text", "").strip(),
            ),
        )
        db.commit()
        flash("Review submitted. Thank you!", "success")
    return redirect(url_for("user_dashboard"))


# ---------------------------------------------------------------------------
# Badge helper
# ---------------------------------------------------------------------------

def _award_badge(db, user_id):
    count = db.execute(
        "SELECT COUNT(*) FROM transactions WHERE user_id=?", (user_id,)
    ).fetchone()[0]
    milestones = {1: "First Book", 5: "Avid Reader", 10: "Bookworm", 25: "Scholar", 50: "Library Champion"}
    if count in milestones:
        existing = db.execute(
            "SELECT id FROM badges WHERE user_id=? AND badge_name=?",
            (user_id, milestones[count]),
        ).fetchone()
        if not existing:
            db.execute(
                "INSERT INTO badges (user_id, badge_name) VALUES (?,?)",
                (user_id, milestones[count]),
            )
            db.commit()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
