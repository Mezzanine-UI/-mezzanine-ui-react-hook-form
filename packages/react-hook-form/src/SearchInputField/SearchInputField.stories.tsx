import { Message } from '@mezzanine-ui/react';
import { useForm } from 'react-hook-form';
import { FormFieldsDebug } from '../FormFieldsDebug';
import { FormFieldsWrapper } from '../FormFieldsWrapper';
import SearchInputField from './SearchInputField';

export default {
  title: 'Data Display/SearchInputField',
};

export const Basic = () => {
  const methods = useForm();

  return (
    <div
      style={{ width: '100%', maxWidth: '680px' }}
    >
      <FormFieldsWrapper
        methods={methods}
      >
        <FormFieldsDebug mode="dev" />
        <p>
          Keyword default debouncing = 500ms
        </p>
        <SearchInputField
          width={300}
          label="Label Name"
          size="large"
          registerName="search-input-register-name-1"
        />
        <br />
        <br />
        <p>
          Keyword debouncing = 800ms
        </p>
        <SearchInputField
          width={300}
          debounceMs={800}
          label="Label Name"
          size="large"
          registerName="search-input-register-name-2"
        />
        <br />
        <br />
        <p>
          Keyword debouncing = 1200ms
        </p>
        <SearchInputField
          width={300}
          debounceMs={1200}
          label="Value As Number"
          size="large"
          registerName="search-input-register-name-3"
        />
        <br />
        <br />
        <p>
          debounced = false
        </p>
        <SearchInputField
          width={300}
          debounced={false}
          label="Value As Number"
          size="large"
          registerName="search-input-register-name-4"
        />
        <p>
          Test onChange
        </p>
        <SearchInputField
          width={300}
          label="Test onChange"
          size="large"
          registerName="search-input-register-name-5"
          onChange={(e) => Message.success?.(e.target.value)}
        />
      </FormFieldsWrapper>
    </div>
  );
};
