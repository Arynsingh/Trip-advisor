document.addEventListener("DOMContentLoaded", () => {
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotWidget = document.getElementById("chatbot-widget");
    const chatbotClose = document.getElementById("chatbot-close");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotSend = document.getElementById("chatbot-send");

    // Open chatbot
    chatbotToggle.addEventListener("click", () => {
        chatbotWidget.style.display = "flex";
        chatbotToggle.style.display = "none";
    });

    // Close chatbot
    chatbotClose.addEventListener("click", () => {
        chatbotWidget.style.display = "none";
        chatbotToggle.style.display = "block";
    });

    // Send message
    function addMessage(text, sender) {
        const msg = document.createElement("div");
        msg.classList.add("message", sender);
        msg.textContent = text;
        chatbotMessages.appendChild(msg);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function botReply(userText) {
        let reply = "Sorry, I don’t have info on that yet.";
        if (userText.toLowerCase().includes("adventure")) reply = "For adventure, I recommend Rishikesh, Interlaken, or Queenstown!";
        if (userText.toLowerCase().includes("beach")) reply = "🌴 Beaches? Try Maldives, Goa, or Phuket!";
        if (userText.toLowerCase().includes("mountain")) reply = "⛰️ Mountains? Swiss Alps, Manali, or Banff are amazing!";
        if (userText.toLowerCase().includes("festival")) reply = "🎉 Festivals? Rio Carnival, Hornbill Festival, or Oktoberfest!";
        
        setTimeout(() => addMessage(reply, "bot"), 600);
    }

    chatbotSend.addEventListener("click", () => {
        const text = chatbotInput.value.trim();
        if (text !== "") {
            addMessage(text, "user");
            chatbotInput.value = "";
            botReply(text);
        }
    });

    chatbotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            chatbotSend.click();
        }
    });
});
