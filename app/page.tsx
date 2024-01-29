import { styled } from "@/app/styles/stitches.config";

const Button = styled("button", {
  backgroundColor: "$green",
  borderRadius: "9999px",
  fontSize: "24px",
  border: "1px solid $green-light",
});

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <Button>Enviar</Button>
    </>
  );
}
