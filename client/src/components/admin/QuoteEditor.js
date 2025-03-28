// client/src/components/admin/QuoteEditor.js
import React from "react";
import styled from "styled-components";
import QuotePreview from "./QuotePreview";

const QuoteEditorContainer = styled.div`
  margin-bottom: 2.5rem;
`;

const QuotesContainer = styled.div`
  margin-top: 1.5rem;
`;

const QuoteItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const QuoteInputs = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const QuoteControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.9rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }

  option {
    background-color: #1a1a1a;
    color: white;
  }
`;

const RemoveButton = styled.button`
  background: rgba(220, 53, 69, 0.1);
  border: none;
  color: rgba(255, 150, 150, 0.9);
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(220, 53, 69, 0.2);
  }
`;

const AddQuoteButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const InputNote = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0.25rem 0 0;
`;

const Label = styled.label`
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  display: block;
`;

const QuoteEditor = ({ quotes = [], onChange }) => {
  // Handle changes to a specific quote
  const handleQuoteChange = (index, field, value) => {
    const updatedQuotes = [...quotes];
    updatedQuotes[index][field] = value;
    onChange(updatedQuotes);
  };

  // Add a new quote
  const addQuote = () => {
    onChange([...quotes, { text: "", attribution: "", position: "right" }]);
  };

  // Remove a quote
  const removeQuote = (index) => {
    const updatedQuotes = quotes.filter((_, i) => i !== index);
    onChange(updatedQuotes);
  };

  return (
    <QuoteEditorContainer>
      <Label>Featured Quotes</Label>
      <InputNote>
        Add memorable quotes to feature in callout boxes throughout your
        article.
      </InputNote>

      {/* Display Preview of Quotes */}
      <QuotePreview quotes={quotes} />

      <QuotesContainer>
        {quotes.map((quote, index) => (
          <QuoteItem key={index}>
            <QuoteInputs>
              <TextArea
                placeholder="Enter quote text..."
                value={quote.text}
                onChange={(e) =>
                  handleQuoteChange(index, "text", e.target.value)
                }
              />
              <Input
                type="text"
                placeholder="Attribution (optional)"
                value={quote.attribution}
                onChange={(e) =>
                  handleQuoteChange(index, "attribution", e.target.value)
                }
              />
              <Select
                value={quote.position}
                onChange={(e) =>
                  handleQuoteChange(index, "position", e.target.value)
                }
              >
                <option value="left">Left sidebar</option>
                <option value="right">Right sidebar</option>
                <option value="center">Center callout</option>
              </Select>
            </QuoteInputs>
            <QuoteControls>
              <RemoveButton onClick={() => removeQuote(index)}>×</RemoveButton>
            </QuoteControls>
          </QuoteItem>
        ))}

        <AddQuoteButton onClick={addQuote}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add Quote
        </AddQuoteButton>
      </QuotesContainer>
    </QuoteEditorContainer>
  );
};

export default QuoteEditor;
