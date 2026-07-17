import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Пожалуйста, заполните все поля" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram credentials are not configured.");
      return NextResponse.json(
        { error: "Внутренняя ошибка сервера" },
        { status: 500 }
      );
    }

    const text = `
Новое сообщение с сайта Blue Sea! 🌊

👤 <b>Имя:</b> ${name}
📧 <b>Email:</b> ${email}
📝 <b>Сообщение:</b>
${message}
    `.trim();

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Telegram API Error:", errorData);
      return NextResponse.json(
        { error: "Ошибка при отправке сообщения" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
