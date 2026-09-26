const CONTACT_STORAGE_KEY = "contactMessages";

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const contactForm =
            document.getElementById("contactForm");

        if (contactForm) {

            contactForm.addEventListener(
                "submit",
                submitContactForm
            );

        }

    }
);

function submitContactForm(event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const subject =
        document.getElementById("subject").value.trim();

    const message =
        document.getElementById("message").value.trim();

    if (
        name === "" ||
        email === "" ||
        subject === "" ||
        message === ""
    ) {

        alert("Please fill in all fields.");

        return;

    }

    let contacts =
        JSON.parse(
            localStorage.getItem(
                CONTACT_STORAGE_KEY
            )
        ) || [];

    const contact = {

        id:
            Date.now(),

        name:
            name,

        email:
            email,

        subject:
            subject,

        message:
            message,

        date:
            new Date().toLocaleString()

    };

    contacts.push(contact);

    localStorage.setItem(
        CONTACT_STORAGE_KEY,
        JSON.stringify(contacts)
    );

    alert(
        "Your message has been sent successfully!"
    );

    document
        .getElementById("contactForm")
        .reset();

}