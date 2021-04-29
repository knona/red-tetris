export function isUsernameValid(username: string): boolean {
  return matches(username, '[A-Za-z0-9]{3,20}');
}

export function isRoomNameValid(roomName: string): boolean {
  return matches(roomName, '[A-Za-z0-9 ]{3,40}');
}

function matches(string: string, regex: string): boolean {
  const match: RegExpMatchArray | null = string.match(regex);
  return (match && string === match[0]) ?? false;
}
