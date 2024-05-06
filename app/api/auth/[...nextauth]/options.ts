import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/types"; // Certifique-se de que isto importa o tipo User extendido corretamente
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

/*
export const options: NextAuthOptions = {
  secret: process.env.AUTH_SECRET, // Certifique-se de que AUTH_SECRET está definido nas suas variáveis de ambiente
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username:",
          type: "text",
          placeholder: "Insira seu nome de usuário",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "Insira sua senha",
        },
      },
      async authorize(credentials) {
        console.log("Dados recebidos para autorização:", credentials);

        const user: User = { id: "42", name: "Dave", role: "admin" }; // Simulação de um usuário

        if (credentials) {
          console.log("Verificando credenciais fornecidas...");
          if (
            credentials.username === user.name &&
            credentials.password === "nextauth"
          ) {
            console.log("Autenticação com sucesso:", user);
            return user; // Sucesso na autenticação
          }
        }

        console.log("Autenticação falhou para as credenciais:", credentials);
        return null; // Falha na autenticação
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Atribuir o papel ao token
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role; // Atribuir o papel ao usuário da sessão
      }
      return session;
    },
  },
};
*/

export const options: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username:",
          type: "text",
          placeholder: "your-cool-username",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "your-awesome-password",
        },
      },
      async authorize(credentials) {
        // This is where you need to retrieve user data
        // to verify with credentials
        // Docs: https://next-auth.js.org/configuration/providers/credentials
        const user = { id: "42", name: "Dave", password: "nextauth" };

        if (
          credentials?.username === user.name &&
          credentials?.password === user.password
        ) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
};
