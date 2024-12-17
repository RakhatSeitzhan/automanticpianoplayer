function resizeImage(file, maxWidth){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const MAX_WIDTH = maxWidth; // Change this value to adjust the maximum width of the resized image
            const scaleFactor = MAX_WIDTH / img.width;
            const width = img.width * scaleFactor;
            const height = img.height * scaleFactor;

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            const resizedImageUrl = canvas.toDataURL('image/jpeg');
            fetch(resizedImageUrl)
                .then(res => res.blob())
                .then(blob => {
                    const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
                    resolve(resizedFile)
            });
            
        };
    };
    reader.readAsDataURL(file);
    })
}

export { resizeImage }
