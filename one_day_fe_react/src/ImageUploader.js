import React from 'react';

const ImageUploader = ({ onImageUpload }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // reader.result contains the Data URL
                onImageUpload(file, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <input type="file" accept="image/*" onChange={handleFileChange} />
    );
};

export default ImageUploader;
