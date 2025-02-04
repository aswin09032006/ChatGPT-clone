import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IKImage } from 'imagekitio-react';
import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import model from '../../lib/gemini';
import Upload from '../Upload/upload';
import './newPrompt.css';

const NewPrompt = ({data}) => {

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const [img, setImg] = useState({
        isLoading: false,
        error: "",
        dbData: {},
        aiData: {},
    })

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{text: "Hello, I have 2 dogs in my house"}]
            },
            {
                role: "model",
                parts: [{text: "Great to meet you. What would you like to know?"}]
            },
        ],
        generationConfig: {
            // maxOutputTokens: 100,
        }
    })

    const endRef = useRef(null);
    const formRef = useRef(null);

    useEffect (() => {
        endRef.current.scrollIntoView({behavior: "smooth"})
    }, [data, question, answer, img.dbData])

    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationFn: () => {
            return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                question: question.length ? question : undefined,
                answer,
                img: img.dbData?.filePath || undefined,
            }),
            }).then((res) => res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat", chat._id] }).then(()=> {
                formRef.current.reset()
                setQuestion("")
                setAnswer("")
                setImg({
                    isLoading: false,
                    error: "",
                    dbData: {},
                    aiData: {},
                })
            });
        },
        onError: (err) => {
            console.error(err);
        }
    });

    const add = async (text, isInitial) => {
        if(!isInitial) setQuestion(text);

        try {
            const result = await chat.sendMessageStream(Object.entries(img.aiData).length ? [img.aiData, text] : [text]);
            let accumulatedText = '';
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                console.log(chunkText);
                accumulatedText+=chunkText;
                setAnswer(accumulatedText);
            }
            mutation.mutate();
        } catch (err) {
            console.error(err);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const text = e.target.text.value;
        if (!text) return;

        add(text, false);
    }

    useEffect (() => {
        if(data?.history?.length === 1){
            add(data.history[0].parts[0].text, true)
        }
    }, [])
    
    return (
        <>
            {img.isLoading && <div className=''>Loading...</div>}
            {img.dbData?.filePath && (
                <IKImage
                    urlEndpoint= {import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path= {img.dbData?.filePath}
                    width="380"
                    transformation={{width: 380}}
                />
            )}
            {question && <div className='message user'>{question}</div>}
            {answer && <div className='message'><Markdown>{answer}</Markdown></div>}
            <div className='endChat' ref={endRef}></div>
            <form className='newForm' onSubmit={handleSubmit} ref={formRef}>
                <Upload setImg={setImg}/>
                <input type="file" multiple={false} id='file' hidden/>
                <input type="text" name="text" placeholder='Ask me anything...'/>
                <button>
                    <img src="/arrow.png" alt="" />
                </button>
            </form>
        </>
    )
}

export default NewPrompt
