import { ImageSourcePropType } from 'react-native';

export const noop = () => {};

export const prettifyTx = (
  text: string,
  startLength: number = 6,
  endLength: number = 4,
) => {
  if (text?.length <= startLength + endLength + 5) {
    return text;
  }
  const start = text.substr(0, startLength);
  const end = text.substr(-endLength);
  return `${start} ··· ${end}`;
};

export const prepareImageSource = (
  uri?: string,
): ImageSourcePropType | null => {
  if (uri) {
    if (uri.startsWith('assets/')) {
      // todo load by path
      // return require(uri);
    }

    if (uri.startsWith('data:') || uri.startsWith('http')) {
      return {
        uri,
      };
    }
  }
  return null;
};
