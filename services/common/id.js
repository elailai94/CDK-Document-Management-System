import ksuid from "ksuid";

function generateID() {
  return ksuid.randomSync().string;
}

export { generateID };
