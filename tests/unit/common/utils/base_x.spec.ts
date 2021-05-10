import {base_x} from '../../../../src/common/utils/base_x';
import * as BaseX from 'base-x';

const converter_mock = {
    encode: jest.fn(),
    decode: jest.fn(),
};

jest.mock('base-x', () => jest.fn().mockImplementation(() => converter_mock));

const ENCODINGS = {
    base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
};

describe('base_x', () =>
{
    const chosen_encoding = base_x.Encoding.BASE58;

    beforeEach(() =>
    {
        jest.clearAllMocks();
        expect.hasAssertions();
    });

    describe('make_encoder', () =>
    {
        let encoder: base_x.BaseXEncoder;

        beforeEach(() =>
        {
            jest.clearAllMocks();
            expect.hasAssertions();

            encoder = base_x.make_encoder(chosen_encoding);
        });

        it('should create an BaseX object with the given encoding', () =>
        {
            expect(BaseX).toHaveBeenCalledWith(ENCODINGS[chosen_encoding]);
        });

        it('should call the encode method of base-x', () =>
        {
            const value_to_encode = Buffer.from('42', 'base64');

            const encode_spy = jest.spyOn(converter_mock, 'encode');

            encoder(value_to_encode);

            expect(encode_spy).toHaveBeenCalledWith(value_to_encode);
        });

        it('should return the encoded value', () =>
        {
            const value_to_encode = Buffer.from('42', 'base64');
            const encoded_result = 'encoded_42';

            jest.spyOn(converter_mock, 'encode').mockReturnValue(encoded_result);

            const result = encoder(value_to_encode);

            expect(result).toEqual(encoded_result);
        });
    });

    describe('make_decoder', () =>
    {
        let decoder: base_x.BaseXDecoder;

        beforeEach(() =>
        {
            jest.clearAllMocks();
            expect.hasAssertions();

            decoder = base_x.make_decoder(chosen_encoding);
        });

        it('should create an BaseX object with the given encoding', () =>
        {
            expect(BaseX).toHaveBeenCalledWith(ENCODINGS[chosen_encoding]);
        });

        it('should call the decode method of base-x', () =>
        {
            const value_to_decode = 'awelfkhasdf';
            const decoded_value = Buffer.from('42');

            const decode_spy = jest.spyOn(converter_mock, 'decode').mockReturnValue(decoded_value);

            decoder(value_to_decode);

            expect(decode_spy).toHaveBeenCalledWith(value_to_decode);
        });

        it('should return the decoded value', () =>
        {
            const value_to_decode = 'awelfkhasdf';
            const decoded_value = Buffer.from('42');

            jest.spyOn(converter_mock, 'decode').mockReturnValue(decoded_value);

            const decoded = decoder(value_to_decode);

            expect(decoded).toEqual(decoded_value);
        });
    });
});
